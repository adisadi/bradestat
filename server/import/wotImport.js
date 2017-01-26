

const redis = require('redis');
const async = require("async");

const WorldOfTanks = require('wargamer').WorldOfTanks;
const Wargaming = require('wargamer').Wargaming;

var rclient = redis.createClient();
rclient.on("error", function (err) {
    console.log("Error " + err);
});


var wot = new WorldOfTanks({ realm: 'eu', applicationId: 'bbbfdd36b7156fefbed419ac0c487a0d' });
var wg = new Wargaming({ realm: 'eu', applicationId: 'bbbfdd36b7156fefbed419ac0c487a0d' });

var GetClanMembers = function (callback) {

    var getBradeClanId = function (callback) {
        //Get Clan Id
        wg.get('clans/list', { search: 'BRADE', game: 'wot' })
            .then((response) => {
                callback(response.data[0].clan_id);
            }).catch((error) => {
                console.log('getBradeClanId:'+error.message);
            });
    };

    var getMembers = function (clanId, callback) {
        //Get MembersId
        wg.get('clans/info', { clan_id: clanId, game: 'wot' })
            .then((response) => {
                  console.log('clanId-->'+clanId);
                  console.log(response.data[clanId].members);
                callback(response.data[clanId].members);
            }).catch((error) => {
                console.log('getMembers:'+error.message);
            });
    };

    getBradeClanId(function (clanId) {
        getMembers(clanId, function (members) {
            callback(members);
        });
    });
};

var GetAvailableStat = function (callback) {
    wot.get('ratings/types')
        .then((response) => {
            let statTypes = [];
            for (let statType in response.data) {
                statTypes.push(response.data[statType]);
            }
            callback(statTypes);
        }).catch((error) => {
            console.log('GetAvailableStat:'+error.message);
        });
};


var GetStats = function (members) {

    var accountIds = members.map(function (member) {
        return member.account_id;
    });

    var statTypes = ["1", "7", "28", "all"];

    var getPlayerRatingdates = function (accountIds, statType) {
        return wot.get('ratings/dates', { account_id: accountIds, type: statType, battle_type: 'random' })
            .then((response) => {
                return { type: statType, dates: response.data["all"].dates };
            }).catch((error) => {
                console.log('getPlayerRatingdates'+error.message);
            });
    };

    var getPlayerRating = function (config, callback) {
        wot.get('ratings/accounts', { account_id: config.accountIds, type: config.statType, battle_type: 'random', date: config.unixdate })
            .then((response) => {
                callback({ type: config.statType, rankings: response.data, date: config.unixdate });
            }).catch((error) => {
                console.log('getPlayerRating:' + error.message);
            });
    }

    var promises = [];
    for (let statType of statTypes) {
        promises.push(getPlayerRatingdates(accountIds, statType));
    }

    Promise.all(promises).then(function () {
        var tasks = []
        for (let statDates of arguments[0]) {
            for (let date of statDates.dates) {
                tasks.push(function (callback) {
                    getPlayerRating({ accountIds: accountIds, statType: statDates.type, unixdate: date }, function (result) {
                        callback(null, result);
                    });
                });
            }
        }

        async.series(tasks, function (err, results) {

            var memberRatings = [];
            for (let statType of statTypes) {
                let memberRating = { type: statType };
                memberRating.dates = {};
                let dates = results.filter(function (obj) {
                    return obj.type === statType;
                }).map(function (obj) {
                    return obj.date;
                });

                for (let date of dates) {
                    let ratings = results.find(function (obj) {
                        return obj.type === statType && obj.date === date;
                    });
                    for (let member of members) {
                        if (memberRating.dates[date] == null)
                            memberRating.dates[date] = [];
                        memberRating.dates[date].push(ratings[member.account_id]);
                    }
                }
                memberRatings.push(memberRating);
            }

            return memberRatings;
        });
    }, function (err) {
        console.log(err);
    });
};



function importWotStat() {

    console.time("import stats");

    var currentDate = new Date();
    rclient.set("execution_time", currentDate);



    GetClanMembers(function (members) {
        //Save Members
        console.log(members);
        for (let member of members) {
            rclient.hmset("member:" + member.account_id, member);
        }

        //Get & Save Available stats
        GetAvailableStat(function (stats) {
            for (let stat of stats) {
                rclient.hmset("stat_type:" + stat.type, "rank_fields", JSON.stringify(stat.rank_fields));
            }
        });

        //Get & Save Stats
        var memberRatings = GetStats(members);

        for (let memberRating of memberRatings) {
            rclient.hmset("rating:" + memberRating.type, "ratings", JSON.stringify(memberRating.dates));
        }

        console.timeEnd("import stats");


    });



};

module.exports = { importWotStat };










