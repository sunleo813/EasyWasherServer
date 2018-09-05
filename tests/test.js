var assert = require('chai').assert;
//var Content = require('../js/content');
//var AliPrecreateContent = require('../js/content');
var MongoAPI = require('../js/mongoAPI')

var mongo = new MongoAPI();

describe('mongoDB', function () {

    describe('Transactions Operations', function () {
        it('AddRecord()', function (done) {
            this.timeout(10000);
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
            mongo.AddRecord('Transactions', record, function (result) {
                if (result === null) {
                    assert.fail();
                    done();
                } else {
                    assert.exists(result);
                    done();
                }

            })
        })

        it('FindRecord-All ', function (done) {
            mongo.FindRecord('Transactions', "", function (result) {
                if (result === null) {
                    assert.fail();
                    done();
                }
                else {
                    assert.equal('ZUH-000-20180905141133', result[0].TradeNO);
                    done();
                }
            })
        })
    })
});


