var assert = require('chai').assert;
var Content = require('../js/content');
var AliPrecreateContent = require('../js/content');

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
            let ali = new AliPrecreateContent('ZUH-001',20);
            let params = ali.createParams();
            assert.equal('alipay.trade.precreate', params.get('method'));
            assert.equal('RSA2', params.get('sign_type'));
        })
    })
    describe('#build', function(){
        it('show paramsString after execute function build', function(){
            let ali=new AliPrecreateContent('ZUH-001',20);
            let paramString=ali.build();
            console.log(paramString);


        })
    })
})