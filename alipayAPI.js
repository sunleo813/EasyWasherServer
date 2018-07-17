var moment = require('moment');
var fs = require('fs');
var crypto = require('crypto');
var request = require('request');
var config = require('./config')
//var qs = require('querystring');

//var return_qr_code_uri;



//gen Biz_Content
function BizContentBuilder(tradeNo) {
    var bizContent = {
        subject: 'EasyTech Auto Car Washing Service ',
        out_trade_no: tradeNo,
        total_amount: config.SERVICE_AMT,
        qr_code_timeout_express: '30m'
    };
    return JSON.stringify(bizContent);
};



//send signed order parameters to alipay gateway
function sendAlipayOrder(signedTrans, cb) {
    var alipayUrl = config.ALIPAY_GATEWAY + signedTrans;
    //console.log(alipayUrl);
    request(alipayUrl, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            var JSONParams = JSON.parse(body);
            //            console.log(JSONParams);
            var replyParams = JSONParams.alipay_trade_precreate_response;
            //           console.log(replyParams.msg);


            if (replyParams.msg == "Success") {
                //console.log(replyParams.qr_code);
                cb(replyParams.qr_code);
            } else {
                cb("Failed");
            }
        }
    })
}



//sign order

function SignWithPrivateKey(signType, content) {
    var sign;
    var privatePem = fs.readFileSync(config.ALIPAY_APP_PRIVATE_KEY_PATH, 'utf8');
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
    params.set('app_id', config.ALIPAY_APP_ID);
    params.set('sign_type', 'RSA2');
    params.set('version', '1.0');
    params.set('notify_url', config.ALIPAY_APP_GATEWAY_URL);
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
    paramsString = paramsString + '&sign=' + signedParams;
    //console.log(paramsString);
    return paramsString;

};

exports.genAlipayTransQRImage = function (outTradeNo, cb) {
    var params = createParams(outTradeNo);
    var resultParams = sendAlipayOrder(params, (result) => {
        //       console.log('retrieve qr code');
        //      console.log("genAlipayTransQRImage result: " + result);
        cb(result);
    });

    buildAlipayNoticeParams = function (data) {
        let params = new Map();
        params.set('notifyTime', data.notify_time);
        params.set('gmtCreate', data.gmt_create);
        params.set('charset', data.charset);
        params.set('sellerEmail', data.seller_email);
        params.set('subject', data.subject);
        params.set('sign', data.sign);
        params.set('buyerId', data.buyer_id);
        params.set('invoiceAmount', data.invoice_amount);
        params.set('notifyId', data.notify_id);
        params.set('fundBillList', data.fund_bill_list);
        params.set('notifyType', data.notify_type);
        params.set('tradeStatus', data.trade_status);
        params.set('receiptAmount', data.receipt_amount);
        params.set('appId', data.app_id);
        params.set('buyerPayAmount', data.buyer_pay_amount);
        params.set('signType', data.sign_type);
        params.set('sellerId', data.seller_id);
        params.set('gmtPayment', data.gmt_payment);
        params.set('notifyTime', data.notify_time);
        params.set('version', data.version);
        params.set('outTradeNo', data.out_trade_no);
        params.set('totalAmount', data.total_amount);
        params.set('tradeNo', data.trade_no);
        params.set('authAppId', data.auth_app_id);
        params.set('buyerLogonId', data.buyer_logon_id);
        params.set('pointAmount', data.point_amount);

        //console.log(params);
        return params;
    }


    function VerifySign(paramString, sign) {
        try {
            let verify;
            //sign = encodeURIComponent(sign);
            verify = crypto.createVerify('RSA-SHA256');
            verify.update(paramString);
            var publicKey = fs.readFileSync(config.ALIPAY_PUBLIC_KEY_PATH, 'utf8');
            //var publicKey = publicPem.toString();
            console.log('sign: ' + sign);
            console.log('public key: ' + publicKey);
            return verify.verify(publicKey, sign, 'base64');

        } catch (err) {
            console.log(err);
            return false;
        }
    }

        exports.verifyReturnNotice = function (postBody) {

            let paramsMap = buildAlipayNoticeParams(postBody);
            paramsMap = [...paramsMap].filter(([k1, v1]) => k1 !== 'sign' && k1 !== 'signType' && v1);
            paramsMap.sort();
            let paramsString = paramsMap.map(([k, v]) => `${k}=${decodeURIComponent(v)}`).join('&');
          //  console.log('paramsString: ' + paramsString);
            return VerifySign(paramsString, postBody.sign);
        }

        // //verify with alipay public key

        //             let verifyResult=VerifySign(paramsString,sign);
        //             console.log('verifyResult: '+verifyResult);

    }

