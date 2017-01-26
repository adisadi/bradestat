const express = require('express');
const router = express.Router();
const redis = require('redis');
const async = require('async');

const helper = require('./../import/wotImport');


/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works');
});

router.get('/members', (req, res) => {
    rclient = redis.createClient();
    var names = [];
    rclient.keys("member*", function (err, rows) {
        async.each(rows,
            function (row, callback) {
                rclient.hget(row, 'account_name', function (e, name) {
                    names.push(name);
                    callback();
                });
            }, function () {
                res.json(names);
            });
    });
});

router.get('/stats/:statType/:statField', (req, res) => {
    rclient = redis.createClient();

    var statType = req.params.statType;
    var statField = req.params.statField;

    var members = {}
    var memberNames = []
    rclient.keys("member*", function (err, rows) {
        async.each(rows,
            function (row, callback) {
                let accountId = row.substr(row.indexOf(":") + 1);
                rclient.hget(row, 'account_name', function (e, name) {
                    members[accountId] = name;
                    memberNames.push(name);
                    callback();
                });
            }, function () {
                rclient.hget("rating:" + statType, 'ratings', function (e, ratings) {
                    var rating = { type: statType, dates: JSON.parse(ratings) };
                    var array = [];

                    for (var date in rating.dates) {
                        var rankings = []
                        for (var r in rating.dates[date]) {
                            var rank = rating.dates[date][r];
                            if (rank != null)
                                rankings.push({ ranking: rank[statField], account_name: members[rank['account_id']] });
                        }
                        array.push({ date: date, rankings: rankings });
                    }
                    res.json({ members: memberNames, dates: array });
                });
            });
    });




});

router.get('/statTypes', (req, res) => {
    rclient = redis.createClient();
    var names = [];
    rclient.keys("stat_type*", function (err, rows) {
        async.each(rows,
            function (row, callback) {
                let statType = row.substr(row.indexOf(":") + 1);
                names.push(statType);
                callback();

            }, function () {
                var sorted = names.sort((s1, s2) => {
                    if (s1.length > s2.length)
                        return 1;
                    if (s1.length < s2.length)
                        return -1;
                    return 0;
                });
                res.json(sorted);
            });
    });
});


router.get('/statFields/:statType', (req, res) => {
    rclient = redis.createClient();
    var statType = req.params.statType;

    rclient.hget("stat_type:" + statType, 'rank_fields', function (e, name) {
        res.json(JSON.parse(name));
    });
});

router.get('/updateStats/:force?', (req, res) => {
    rclient = redis.createClient();
    var force = req.params.force;

    rclient.get("execution_time", function (err, date) {
        var date = new Date(date);
        if (date.getDate() != new Date().getDate() || (force === 'true')) {
            updateStats(res);
        }
        else {
            res.json({ status: 'stats not updated', lastUpdate: date });
        }
    });


});

router.get('/updateDate/', (req, res) => {
    rclient = redis.createClient();

    rclient.get("execution_time", function (err, date) {
        var date = new Date(date);
        res.json(date);
    });
});

var updateStats = function (res) {
    helper.importWotStat();

    res.json({ status: 'stats updated', lastUpdate: new Date() });
}

module.exports = router;