var moment = require('moment');
var fs = require('fs');
var crypto = require('crypto');
var config = require('./config');

class Content {

    constructor(outTradeNo,serviceAmount) {
        this.outTradeNo = outTradeNo;
        this.serviceAmount=serviceAmount;
    }

    signWithPrivateKey(signType, content) {
        let sign;
        let privatePem = fs.readFileSync(config.ALIPAY_APP_PRIVATE_KEY_PATH, 'utf8');
        let privateKey = privatePem.toString();
        if (signType.toUpperCase() === 'RSA2') {
            sign = crypto.createSign("RSA-SHA256");

        } else if (signType.toUpperCase() === 'RSA') {
            sign = crypto.createSign("RSA-SHA1");

        } else {
            throw new Error('SignType format not correct: ' + signType);
        }
        sign.update(content);
        sign = sign.sign(privateKey, 'base64');
        return encodeURIComponent(sign);
    }


    makeParamsString(params) {

        //sort params and clear empty field
        let paramList = [...params].filter(([k1, v1]) => k1 !== 'sign' && v1);
        paramList.sort();

        //join params with & character
        let paramsString = paramList.map(([k, v]) => `${k}=${v}`).join('&');
        return paramsString;
    }


    createParams() {
        let params = new Map();
        params.set('timestamp', moment().format('YYYY-MM-DD HH:mm:ss'));
        params.set('app_id', config.ALIPAY_APP_ID);
        params.set('sign_type', 'RSA2');
        params.set('version', '1.0');
        params.set('charset', 'utf-8');
        return params;
    };

    build() {
        var params = this.createParams();
        var paramsString = this.makeParamsString(params);
        var sign = this.signWithPrivateKey(params.get('sign_type'), paramsString);
        paramsString += '&sign=' + sign;
        return paramsString;
        // sendAlipayOrder(paramsString, 'alipay.trade.precreate', (result) => {
        //     cb(result);
    }
}

class AliPrecreateContent extends Content {
    constructor(outTradeNo,serviceAmount) {
        super(outTradeNo,serviceAmount);

    }


    bizContentBuilder() {
        var bizContent = {
            subject: 'EasyTech Auto Car Washing Service ',
            out_trade_no: this.outTradeNo,
            total_amount: this.serviceAmount,
            qr_code_timeout_express: '30m'
        };
        return JSON.stringify(bizContent);
    }

    createParams() {
        let params = super.createParams();
        params.set('method', 'alipay.trade.precreate');
        params.set('notify_url', config.ALIPAY_APP_GATEWAY_URL);
        params.set('biz_content', this.bizContentBuilder());
        return params;
    }


}
module.exports = Content;
module.exports = AliPrecreateContent;





