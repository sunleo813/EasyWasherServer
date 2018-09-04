var assert = require('chai').assert;
//var Content = require('../js/content');
//var AliPrecreateContent = require('../js/content');
var AlipayRequestSender = require('../js/requestSender');
import { Content, AliPrecreateContent, AliQueryContent } from '../js/content.js'
var moment = require('moment');

describe('Content', function () {
    describe('#constructor()', function () {
        it('should return 1234 ', function () {
            let content = new Content('1234');
            assert.equal('1234', content.outTradeNo);
        });
    });
});

describe('AliPrecreateContent', function () {
    describe('#constructor', function () {
        it('should return ZUH-001', function () {
            let ali = new AliPrecreateContent('ZUH-001');
            assert.equal('ZUH-001', ali.outTradeNo);
        })
    })
    describe('#createParams', function () {
        it('method should return params from both Content & AliprecreateContent', function () {
            let ali = new AliPrecreateContent('ZUH-001', 20);
            let params = ali.createParams();
            assert.equal('alipay.trade.precreate', params.get('method'));
            assert.equal('RSA2', params.get('sign_type'));
        })
    })
    describe('#build', function () {
        it('show paramsString after execute function build', function () {
            let ali = new AliPrecreateContent('ZUH-001', 20);
            let paramString = ali.build();
            console.log(paramString);


        })
    })
})

describe('AlipayRequestSender', function () {
    var paramsString;
    var ali;

    before(function () {
        let id = 'ZUH-000-' + moment().format('YYYYMMDDHHmmss');
        let aliContent = new AliPrecreateContent(id, 18);
        paramsString = aliContent.build();
        ali = new AlipayRequestSender(paramsString, 'alipay.trade.precreate');
    })
    describe('#constructor', function () {
        it('check properties after constructor execute', function () {
            assert.equal("alipay.trade.precreate", ali.methodType)
            assert.equal(paramsString, ali.paramString);
            console.log(ali.alipayUrl)
        })
        it('All variables in sender should work', function (done) {
            // console.log('ali value= ' + JSON.stringify(ali));
            //console.log("paramsString value: " + paramsString);
            ali.sendRequest(function (result) {
                console.log('test-sendRequest: ' + result)
                assert.isNotNull(result);
                assert.equal('Success', result.msg);
                done();
            })
        })
    })

    // describe('#sendRequest', function (done) {

    //         it('All variables in sender should work', function () {
    //             console.log('ali value= ' + JSON.stringify(ali));
    //             console.log("paramsString value: " + paramsString);


    // ali.sendRequest(function(result){

    //     assert.equal('Success',result.msg);
    //     done();
    //         // })
    //     })

    //  })
})