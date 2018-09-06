var mongoClient = require('mongodb').MongoClient;
var config = require('./config');
var async = require("async");

class MongoDB {

    makeConnection(cb) {

        mongoClient.connect(config.DB_URL, function (err, dbo) {
            if (err) {
                console.log('Fail to connect DB!!!!!')
                cb(err, null)
            }
            else {
                cb(null, dbo);
            }
        })

    };




    insertDB(dbo, collection, record, cb) {
        var db = dbo.db('EasyWasherDB');
        db.collection(collection).insertOne(record, (err, result) => {
            if (err) {
                dbo.close();
                cb(err, null);
            } else {
                dbo.close();
                cb(null, result);
            }
        })
    }

    findDB(dbo, collection, params, cb) {
        //        console.log('findDB running on collection: ' + collection)
        var db = dbo.db("EasyWasherDB");
        if (params === "") {
            db.collection(collection).find({}).toArray((err, res) => {
                if (err) {
                    dbo.close();
                    cb(err, null);
                } else {
                    dbo.close()
                    cb(null, res);
                }
            })
        }
        else {
            var collection = db.collection(collection);
            collection.find(params).toArray((err, res) => {
                if (err) {
                    dbo.close();
                    cb(err, null);
                } else {
                    dbo.close()
                    cb(null, res);
                }
            })
        }
    }

    AddRecord(collection, record, callback) {
        var that = this;
        async.waterfall([
            function (cb) {
                that.makeConnection((err, db) => {
                    if (err)
                        cb(err, null);
                    else
                        cb(null, db);
                })
            },
            function (db, cb) {
                that.insertDB(db, collection, record, (err, result) => {
                    if (err)
                        cb(err, null);
                    else
                        cb(null, result);
                })
            }
        ], function (err, result) {
            if (err) {
                console.log("MongoAPI-AddRecord: Fail to add record to DB!!");
                callback(null);
            } else {
                //               console.log("AddRecord-end result: "+result)
                callback(result);
            }
        })
    }


    //Return array of records, if cannot find any record, will return []
    FindRecord(collection, params, callback) {
        var that = this;
        async.waterfall([
            function (cb) {
                that.makeConnection((err, db) => {
                    if (err)
                        cb(err, null);
                    else
                        cb(null, db);
                })
            },
            function (db, cb) {
                that.findDB(db, collection, params, (err, res) => {
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

module.exports = MongoDB;