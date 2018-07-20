var mongoClient = require('mongodb').MongoClient;
var config = require('./config');
var async = require("async");

function mongoDB() {

    makeConnection = function (cb) {

        mongoClient.connect(config.DB_URL, function (err, dbo) {
            if (err) {
                throw err;
            }
            else {
                console.log('database online');
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
                console.log('record insert success');
                cb(result);
            }
        })
    }

    findDB = function (dbo, record, cb) {

        var db = dbo.db("EasyWasherDB");
        var result;

        if (record === "") {
            db.collection("Transactions").find({}).toArray((err, res) => {
                result = res
            })
        }
        else {
            db.collection("Transactions").find(record).toArray((err, res) => {
                result = res
            })
        }
        db.close()
        cb(result);
    }

    this.AddRecord = function (record) {

        console.log('AddRecord run');
        async.series([
            function (cb) {
                makeConnection((db) => {
                    cb(null, db);
                })
            },
            function (db, cb) {
                console.log('db value before call insertDB" '+db);
                insertDB(db, (result) => {
                    cb(result);
                })
            }
        ], function (err, result) {
            if (err !== "") {
                console.log('Database ADD operations error: ' + err);
            }
            else {
                console.log(result);
            }
        })
    }
}


this.FindRecord = function (record) {
    try {
        var dbo = makeConnection()
        return findDB(dbo, record)

    } catch (err) {
        //better send sms to support team
        console.log('Database ADD operations error: ' + err);
    }

}




module.exports = mongoDB;