var mongoClient = require('mongodb').MongoClient;
var config = require('./config');
var async = require("async");

var mongoDB = function () {

    makeConnection = function (cb) {

        mongoClient.connect(config.DB_URL, function (err, dbo) {
            if (err) {
                console.log('Fail to connect DB!!!!!')
                throw err;
            }
            else {
                cb(dbo);
            }
        })

    };




    insertDB = function (dbo, record, cb) {
        var db = dbo.db('EasyWasherDB');
        db.collection('Transactions').insertOne(record, (err, result) => {
            if (err) {
                dbo.close();
                throw err;
            } else {
                dbo.close();
                cb(null, result);
            }
        })
    }

    findDB = function (dbo, params, cb) {

        var db = dbo.db("EasyWasherDB");
        if (params === "") {
            db.collection("Transactions").find({}).toArray((err, res) => {

                dbo.close()
                cb(res);
            })
        }
        else {
            var collection = db.collection('Transactions');
            collection.find(params).toArray((err, res) => {
                dbo.close()
                cb(res);
            })
        }
    }

    this.AddRecord = function (record) {
        async.waterfall([
            function (cb) {
                makeConnection((db) => {
                    cb(null, db);
                })
            },
            function (db, cb) {
                insertDB(db, record, (result) => {
                    cb(null, result);
                })
            }
        ], function (err, result) {
            if (err) {
                console.log("MongoAPI-AddRecord: Fail to add record to DB!!");
            }
        })
    }



    this.FindRecord = function (params, callback) {
        async.waterfall([
            function (cb) {
                makeConnection((db) => {
                    cb(null, db);
                })
            },
            function (db, cb) {
                findDB(db, params, (res) => {
                    cb(null, res);
                })
            }
        ], function (err, res) {
            if (err) {
                callback(null);
            } else {
                callback(res);
            }
        })

    };
}

module.exports = mongoDB;