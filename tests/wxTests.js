var WeixinManager = require('../js/wx')
var assert = require('chai').assert;

var wxManager = new WeixinManager();

describe('WeixinManager', function () {
    this.timeout(30000);
    it('getPrepayID', function (done) {
        var order = {
            out_trade_no: '12121212',
            total_fee: 18
        }
        wxManager.getPrepayID(order, function (result) {
            console.log(JSON.stringify(result));
           
            assert.equal(result.msg, 'failed');
            done();
        });

    })
})
