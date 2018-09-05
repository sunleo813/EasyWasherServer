var mongoClient = require('mongodb').MongoClient;
var config = require('./config');
var async = require("async");

class MongoDB {

    makeConnection(cb) {

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




    insertDB(dbo, collection, record, cb) {
        var db = dbo.db('EasyWasherDB');
        db.collection(collection).insertOne(record, (err, result) => {
            if (err) {
                dbo.close();
                throw err;
            } else {
                dbo.close();
                cb(null, result);
            }
        })
    }

    findDB(dbo, collection, params, cb) {

        var db = dbo.db("EasyWasherDB");
        if (params === "") {
            db.collection(collection).find({}).toArray((err, res) => {
                if (err) {
                    dbo.close();
                    throw err;
                } else {
                    dbo.close()
                    cb(res);
                }
            })
        }
        else {
            var collection = db.collection(collection);
            collection.find(params).toArray((err, res) => {
                if (err) {
                    dbo.close();
                    throw err;
                } else {
                    dbo.close()
                    cb(res);
                }
            })
        }
    }

    AddRecord(record) {
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



    FindRecord(params, callback) {
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

module.exports= MongoDB;