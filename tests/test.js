var assert = require('chai').assert;
//var Content = require('../js/content');
//var AliPrecreateContent = require('../js/content');
// 
var MongoDB = require('../js/mongoAPI')


describe('mongoDB', function () {
    var db;
    var mongo=new MongoDB;
    describe('#makeConnection', function () {
        it('should return db object ', function (done) {
            mongo.makeConnection(function (dbo) {
                console.log(dbo)
                assert.exists(dbo);
                this.db=dbo;
                done() 
            })
        });

    });
    describe('#insertDB- insert record to collection Transaction', function () {
        it('Insert record and should return object result', function () {
            var record = {
                TradeNO: 'ZUH-000-20180905141133',
                TotalAmount: 18,
                Subject: 'MOCHA TEST',
                NotifyTime: Date.now(),
                TradeStatus: 'TRADE_SUCCESS',
                PaymentMethod: 'Alipay',
                BuyerLogonID: 'mocha-test',
                BuyerUserID: 'mocha-test'
            };
            mongo.insertDB(this.db,'Transactions',record,function(err,result){
                assert.fail(err);
                assert.exists(result);
            })

        })
    })
});


