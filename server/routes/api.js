const express = require('express');
const router = express.Router();
const redis = require('redis');
const async = require('async');

const rclient = require('./../redis').rclient;

const helper = require('./../import/wotImport');

const winston = require('./../logger').winston;


/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works');
});

router.get('/members', (req, res) => {
    var names = [];
    rclient.keys("member*", function (err, rows) {
        async.each(rows,
            function (row, callback) {
                rclient.hget(row, 'account_name', function (e, name) {
                    names.push(name);
                    callback();
                });
            }, function () {
                winston.info('/members', names);
                res.json(names);
            });
    });
});

router.get('/stats/:statType/:statField', (req, res) => {
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

                    let newArray=array.map((obj)=>{
                        return {date:new Date(obj.date*1000),rankings: obj.rankings};
                    });

                    winston.info('/stats', { members: memberNames, dates: newArray });
                    res.json({ members: memberNames, dates: array });
                });
            });
    });
});

router.get('/statTypes', (req, res) => {
    var names = [];
    rclient.keys("stat_type*", function (err, rows) {
        async.each(rows,
            function (row, callback) {
                let statType = row.substr(row.indexOf(":") + 1);
                names.push(statType);
                callback();

            }, function () {
                var sorted = names.sort((s1, s2) => {
                    if (isNaN(s1))
                        return 1;
                    if (isNaN(s2))
                        return -1;

                    return parseInt(s1) - parseInt(s2);
                });
                winston.info('/statTypes', sorted);
                res.json(sorted);
            });
    });
});


router.get('/statFields/:statType', (req, res) => {
    var statType = req.params.statType;
    rclient.hget("stat_type:" + statType, 'rank_fields', function (e, name) {
        winston.info('/statFields', name);
        res.json(JSON.parse(name));
    });
});

router.get('/updateStats/:force?', (req, res) => {
    var force = req.params.force;
    rclient.get("execution_time", function (err, date) {
        var date = new Date(date);
        if (date.getDate() != new Date().getDate() || (force === 'true')) {
            helper.importWotStat(function (exeDate, t) {
                winston.info('/statFields', { status: 'UPDATED', lastUpdate: exeDate, executionTime: t });
                res.json({ status: 'UPDATED', lastUpdate: exeDate, executionTime: t });
            });
        }
        else {
            winston.info('/statFields', { status: 'NOTUPDATED', lastUpdate: date });
            res.json({ status: 'NOTUPDATED', lastUpdate: date });
        }
    });
});

router.get('/updateDate/', (req, res) => {
    rclient.get("execution_time", function (err, date) {
        var date = new Date(date);
        res.json(date);
    });
});


module.exports = router;