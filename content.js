var moment=require('moment');
var fs=require('fs');
var crypto=require('crypot');
var config=require('./config');

class Content{

    constructor(outTradeNo){
        this.outTradeNo=outTradeNo;
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
    

    createParams(transType, outTradeNo) {
        let params = new Map();
        params.set('timestamp', moment().format('YYYY-MM-DD HH:mm:ss'));
        params.set('app_id', config.ALIPAY_APP_ID);
        params.set('sign_type', 'RSA2');
        params.set('version', '1.0');
        params.set('charset', 'utf-8');
        return params;
    };

    build(outTradeNo){};
}

class AliPrecreateContent extends Content{
    constructor(outTradeNo){
        super(outTradeNo);
        let params =createParams(outTradeNo);
        params.set('method', 'alipay.trade.precreate');
        params.set('notify_url', config.ALIPAY_APP_GATEWAY_URL);
        params.set('biz_content', PrecreateBizContentBuilder(outTradeNo));

    }
    

}