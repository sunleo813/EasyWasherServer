var moment = require('moment');
var fs = require('fs');
var crypto = require('crypto');
var http = require('http');

//var qr = require('qr-image');

var accountSettings = {
    //APP_ID: '2018062660487015',
    APP_ID: '2016091400507437',
    APP_GATEWAY_URL: 'http://ec2-34-219-4-10.us-west-2.compute.amazonaws.com/alipay/pay_notice.js',
    APP_PRIVATE_KEY_PATH: './pem/Alipay_App_Prikey2048.pem',
    //ALIPAY_GATEWAY: 'https://openapi.alipay.com/gateway.do?',
    ALIPAY_GATEWAY:'openapi.alipaydev.com/gateway.do',
    SERVICE_AMT: 15
};

//gen Biz_Content
function BizContentBuilder(tradeNo) {
    var bizContent = {
        subject: 'EasyWasher Car Wash Service',
        out_trade_no: tradeNo,
        total_amount: accountSettings.SERVICE_AMT
    };
    return JSON.stringify(bizContent);
};



function BuildSignedTrans(paramMap) {
    var paramList = [...paramMap].filter(([k1, v1]) => k1 !== 'sign' && v1);
    paramList.sort();
    var paramsString = paramList.map(([k, v]) => `${k}=${v}`).join('&');
    var privateKey = fs.readFileSync(accountSettings.APP_PRIVATE_KEY_PATH, 'utf8');
   // console.log(privateKey);
    var signType = paramMap.get('sign_type');
    return SignWithPrivateKey(signType, paramsString, privateKey);
}

//sign order

function SignWithPrivateKey(signType, content, privateKey) {
    var sign;
    if (signType.toUpperCase() === 'RSA2') {
        sign=crypto.createSign("RSA-SHA256");
   //     console.log('SignType: RSA2');
    } else if (sign.toUpperCase()==='RSA') {
        sign=crypto.createSign("RSA-SHA1");
  //      console.log('SignType: RSA-SHA1');
    } else {
        throw new Error('SignType format not correct: '+signType);
    }
    sign.update(content);
    return sign.sign(privateKey, 'base64');
}

function sendAlipayOrder(signedTrans){
    var options={
        hostname: accountSettings.ALIPAY_GATEWAY,
        port:443,
        path:signedTrans,
        method:'GET'
    };
    var req=http.request(options, function(res){
        console.log('Status:'+res.statusCode);
        console.log('Headers:'+JSONP.stringify(res.headers));
        res.setEncoding('utf-8');
        res.on('data',(chunk)=>{
            console.log(chunk);
        })
        res.on('end',()=>{
            console.log('response end');
        })
    })
    req.on('error',(err)=>{
        console.error(err);
    });

    req.end();

}

genSignedOrder = function (outTradeNo) {
    var params = new Map();
    params.set('app_id', accountSettings.APP_ID);
    params.set('method', 'alipay.trade.precreate');
    params.set('charset', 'utf-8');
    params.set('sign_type', 'RSA2');
    params.set('timestamp', moment().format('YYYY-MM-DD HH:mm:ss'));
    params.set('version', '1.0');
    params.set('notify_url', accountSettings.APP_GATEWAY_URL);
    params.set('biz_content', BizContentBuilder(outTradeNo));
    params.set('sign', BuildSignedTrans(params));
    return [...params].map((k,v)=>`${k}=${encodeURIComponent(v)}`).join('&');
};

exports.genAlipayTransQRImage=function(outTradeNo){
    var signedTransOrder=genSignedOrder(outTradeNo);
    //var qrImage=qr.image(signedTransOrder,{size:10});
    //return qrImage;
    return sendAlipayOrder(signedTransOrder);
}

