
const fs = require('fs');
var AlipaySdk = require('alipay-sdk');
const moment = require('moment');

var accountSettings = {
    //APP_ID: '2018062660487015',
    APP_ID: '2016091400507437',
    APP_GATEWAY_URL: 'http://ec2-34-219-4-10.us-west-2.compute.amazonaws.com/alipay/pay_notice.js',
    APP_PRIVATE_KEY_PATH: './pem/Alipay_App_Prikey2048.pem',
    //ALIPAY_GATEWAY: 'https://openapi.alipay.com/gateway.do?',
    ALIPAY_GATEWAY: 'https://openapi.alipaydev.com/gateway.do?',
    SERVICE_AMT: 15
};

function bizContentBuilder(tradeNo) {
    var bizContent = {
        subject: 'EasyWasher Car Wash Service',
        out_trade_no: tradeNo,
        total_amount: accountSettings.SERVICE_AMT.stringify,
        qr_code_timeout_express: '30m'
    }
    return bizContent;
};

function paramsBuilder(tradeNo) {
    return {
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        notify_url: accountSettings.APP_GATEWAY_URL,
        biz_content: bizContentBuilder(tradeNo)
    }
};

// params.set('app_id', accountSettings.APP_ID);
// params.set('method', 'alipay.trade.precreate');
// params.set('charset', 'utf-8');
// params.set('sign_type', 'RSA2');
// params.set('timestamp', moment().format('YYYY-MM-DD HH:mm:ss'));
// params.set('version', '1.0');
// params.set('notify_url', accountSettings.APP_GATEWAY_URL);
// params.set('biz_content', BizContentBuilder(outTradeNo));
// params.set('sign', BuildSignedTrans(params));



var alipaySdk =  new AlipaySdk({
    appID: accountSettings.APP_ID,
    privateKey: fs.readFileSync('./pem/Alipay_App_Prikey2048.pem', 'ascii'),
    alipayPublicKey: fs.readFileSync('./pem/alipay_public_key.pem', 'ascii')
});

exports.genAlipayTransQRImage = async function (outTradeNo) {
    var params = paramsBuilder(outTradeNo);
    var result = await alipaySdk.exec('alipay.trade.precreate', params);
    console.log(result);
    return result;
}