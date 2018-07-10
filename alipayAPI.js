var moment = require('moment');
var fs = require('fs');
var crypto = require('crypto');
var request = require('request');



var accountSettings = {
    //APP_ID: '2018062660487015',
    APP_ID: '2016091400507437',
    APP_GATEWAY_URL: 'http://ec2-34-219-4-10.us-west-2.compute.amazonaws.com/alipay/pay_notice.js',
    //APP_GATEWAY_URL: 'http://www.alipay.com',
    //APP_PRIVATE_KEY_PATH: './pem/Alipay_App_Prikey2048.pem',
    APP_PRIVATE_KEY_PATH: './pem/Sandbox/AppPrivateKey.txt',
    //ALIPAY_GATEWAY: 'https://openapi.alipay.com/gateway.do?',
    ALIPAY_GATEWAY: 'https://openapi.alipaydev.com/gateway.do?',
    SERVICE_AMT: '15.00'
};

//gen Biz_Content
function BizContentBuilder(tradeNo) {
    var bizContent = {
        subject: 'EasyTech',
        out_trade_no: tradeNo,
        total_amount: accountSettings.SERVICE_AMT,
        qr_code_timeout_express: '30m'
    };
    return JSON.stringify(bizContent);
};

//send signed order parameters to alipay gateway
function sendAlipayOrder(signedTrans) {
    var alipayUrl = accountSettings.ALIPAY_GATEWAY + signedTrans;
    //console.log(alipayUrl);
    request(alipayUrl, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            console.log(body);
            return body;
        }
    })
}



//sign order

function SignWithPrivateKey(signType, content) {
    var sign;
    var privatePem = fs.readFileSync(accountSettings.APP_PRIVATE_KEY_PATH, 'utf8');
    var privateKey = privatePem.toString();
    if (signType.toUpperCase() === 'RSA2') {
        sign = crypto.createSign("RSA-SHA256");
        // console.log('SignType: RSA2');
    } else if (signType.toUpperCase() === 'RSA') {
        sign = crypto.createSign("RSA-SHA1");
        //      console.log('SignType: RSA-SHA1');
    } else {
        throw new Error('SignType format not correct: ' + signType);
    }
    sign.update(content);
    sign = sign.sign(privateKey, 'base64');
    return encodeURIComponent(sign);
}


createParams = function (outTradeNo) {
    var params = new Map();
    params.set('timestamp', moment().format('YYYY-MM-DD HH:mm:ss'));
    params.set('method', 'alipay.trade.precreate');
    params.set('app_id', accountSettings.APP_ID);
    params.set('sign_type', 'RSA2');
    params.set('version', '1.0');
    params.set('notify_url', accountSettings.APP_GATEWAY_URL);
    params.set('charset', 'utf-8');
    params.set('biz_content', BizContentBuilder(outTradeNo));

    //sort params and clear empty field
    var paramList = [...params].filter(([k1, v1]) => k1 !== 'sign' && v1);
    //console.log(paramList);
    paramList.sort();
    //console.log(paramList);

    //join params with & character
    var paramsString = paramList.map(([k, v]) => `${k}=${v}`).join('&');
    //console.log(paramsString);
    var signedParams = SignWithPrivateKey(params.get('sign_type'), paramsString);
    //var sign=BuildSignedTrans(params.get('sign_type'),paramsString);
    paramsString = paramsString + '&sign=' + signedParams;
    //console.log(paramsString);
    return paramsString;

};

exports.genAlipayTransQRImage = function (outTradeNo) {
    var params = createParams(outTradeNo);
    return sendAlipayOrder(params);
    //return signedTransOrder;
}

