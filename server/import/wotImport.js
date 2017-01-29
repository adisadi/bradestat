

const redis = require('redis');
const async = require("async");

const config = require('./../config.json');

const WorldOfTanks = require('wargamer').WorldOfTanks;
const Wargaming = require('wargamer').Wargaming;

const rclient = require('./../redis').rclient;

console.log(config);

var wot = new WorldOfTanks({ realm: 'eu', applicationId: config.applicationId });
var wg = new Wargaming({ realm: 'eu', applicationId: config.applicationId });

var GetClanMembers = function (callback) {

    var getBradeClanId = function (callback) {
        //Get Clan Id
        wg.get('clans/list', { search: 'BRADE', game: 'wot' })
            .then((response) => {
                callback(response.data[0].clan_id);
            }).catch((error) => {
                console.log('getBradeClanId:' + error);
            });
    };

    var getMembers = function (clanId, callback) {
        //Get MembersId
        wg.get('clans/info', { clan_id: clanId, game: 'wot' })
            .then((response) => {
                callback(response.data[clanId].members);
            }).catch((error) => {
                console.log('getMembers:' + error);
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
            console.log('GetAvailableStat:' + error.message);
        });
};


var GetStats = function (members, callback) {

    var accountIds = members.map(function (member) {
        return member.account_id;
    });

    var statTypes = ["1", "7", "28", "all"];

    var getPlayerRatingdates = function (accountIds, statType, callback) {
        wot.get('ratings/dates', { account_id: accountIds, type: statType, battle_type: 'random' })
            .then((response) => {
                callback({ type: statType, dates: response.data["all"].dates });
            }).catch((error) => {
                console.log('getPlayerRatingdates:' + error);
            });
    };

    var getPlayerRating = function (config, callback) {
        wot.get('ratings/accounts', { account_id: config.accountIds, type: config.statType, battle_type: 'random', date: config.unixdate })
            .then((response) => {
                callback({ type: config.statType, rankings: response.data, date: config.unixdate });
            }).catch((error) => {
                console.log('getPlayerRating:' + error);
            });
    }

    var promises = [];
    for (let statType of statTypes) {
        promises.push(function (callback) {
            getPlayerRatingdates(accountIds, statType, function (result) {
                callback(null, result);
            });
        });
    }

    async.series(promises, function (err, resultsDates) {

          if (err) console.log('getPlayerRatingdates:' + err);

        var tasks = []
        for (let statDates of resultsDates) {
            for (let date of statDates.dates) {
                tasks.push(function (callback) {
                    getPlayerRating({ accountIds: accountIds, statType: statDates.type, unixdate: date }, function (result) {
                        callback(null, result);
                    });
                });
            }
        }

        async.series(tasks, function (err, results) {

            if (err) console.log('getPlayerRating:' + err);

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
                        memberRating.dates[date].push(ratings.rankings[member.account_id]);
                    }
                }
                memberRatings.push(memberRating);
            }

            callback(memberRatings);
        });
    });
};



function importWotStat(callback) {

    var currentDate = new Date();
    rclient.set("execution_time", currentDate);

    GetClanMembers(function (members) {
        //Save Members
        console.log('Save Members');
        for (let member of members) {
            rclient.hmset("member:" + member.account_id, member);
        }

        console.log('Get & Save Available stats');
        //Get & Save Available stats
        GetAvailableStat(function (stats) {
            for (let stat of stats) {
                rclient.hmset("stat_type:" + stat.type, "rank_fields", JSON.stringify(stat.rank_fields));
            }
        });

        //Get & Save Stats

        console.log('Get & Save Stats');
        var memberRatings = GetStats(members, function (memberRatings) {
            for (let memberRating of memberRatings) {
                rclient.hmset("rating:" + memberRating.type, "ratings", JSON.stringify(memberRating.dates));
            }

            let end = new Date() - currentDate;
            console.log("Execution time: %dms", end);

            callback(currentDate,end)

        });
    });



};

module.exports = { importWotStat };










