var moment = require('moment');
var fs = require('fs');
var crypto = require('crypto');
var request = require('request');
var config = require('./config')

//var qs = require('querystring');

//var return_qr_code_uri;

//const db = new MongoAPI();


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

//sign order

function signWithPrivateKey(signType, content) {
    var sign;
    var privatePem = fs.readFileSync(config.ALIPAY_APP_PRIVATE_KEY_PATH, 'utf8');
    var privateKey = privatePem.toString();
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

function verifySign(paramString, sign) {
    try {
        let verify;
        sign = decodeURIComponent(sign);
        verify = crypto.createVerify('RSA-SHA256');
        verify.update(paramString);
        var publicKey = fs.readFileSync(config.ALIPAY_PUBLIC_KEY_PATH, 'utf8');
        return verify.verify(publicKey, sign, 'base64');

    } catch (err) {
        console.log('api-verifySign: '+err);
        return false;
    }
}

makeParamsString = function (params) {

    //sort params and clear empty field
    var paramList = [...params].filter(([k1, v1]) => k1 !== 'sign' && v1);
    paramList.sort();

    //join params with & character
    var paramsString = paramList.map(([k, v]) => `${k}=${v}`).join('&');
    return paramsString;
}


createParams = function (transType, outTradeNo) {
    var params = new Map();
    params.set('timestamp', moment().format('YYYY-MM-DD HH:mm:ss'));
    params.set('app_id', config.ALIPAY_APP_ID);
    params.set('sign_type', 'RSA2');
    params.set('version', '1.0');
    params.set('charset', 'utf-8');
    switch (transType) {
        case 'precreate':
            params.set('method', 'alipay.trade.precreate');
            params.set('notify_url', config.ALIPAY_APP_GATEWAY_URL);
            params.set('biz_content', BizContentBuilder(outTradeNo));
            break;
        case 'query':
            params.set('method', 'alipay.trade.query');
            params.set('biz_content', JSON.stringify({ out_trade_no: outTradeNo }));
            break;  
        case 'transfer':
            param.set ('method', 'alipay.fund.transfer');
            param.set ('biz_content', TransferBizContentBuilder());
    }
    return params;
    // var paramsString = makeParamsString(params);
    // var signedParams = SignWithPrivateKey(params.get('sign_type'), paramsString);
    // paramsString = paramsString + '&sign=' + signedParams;
    // return paramsString;

};


//send signed order parameters to alipay gateway
function sendAlipayOrder(signedTrans, methodType, cb) {
    let alipayUrl = config.ALIPAY_GATEWAY + signedTrans;
    let replyParams = {};
    request(alipayUrl, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            var JSONParams = JSON.parse(body);
            if (methodType === 'alipay.trade.query') {
                replyParams = JSONParams.alipay_trade_query_response;
            }
            if (methodType === 'alipay.trade.precreate') {
                replyParams = JSONParams.alipay_trade_precreate_response;
            };
            //let replyParamsString = JSON.stringify(replyParams);
            //           console.log('qr-code return verify string:' + replyParamsString);
            // let result = VerifySign(replyParamsString, JSONParams.sign);
            //console.log("qr-code retrun verify result:  " + result);
            if (replyParams.msg === "Success") {
                //console.log(replyParams.qr_code);
                cb(replyParams);
            } else {
                cb("Failed");
            }
        }
    })
}


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

queryPaymentStatus = function (tradeNo) {
    let params = new Map();
    params.set('timestamp', moment().format('YYYY-MM-DD HH:mm:ss'));
    params.set('method', 'alipay.trade.query');
    params.set('app_id', config.ALIPAY_APP_ID);
    params.set('sign_type', 'RSA2');
    params.set('version', '1.0');
    params.set('charset', 'utf-8');
    params.set('biz_content', JSON.stringify({ trade_no: tradeNo }));
    let paramsString = makeParamsString(params);
    let signedParams = signWithPrivateKey(params.get('sign_type'), paramsString);
    paramsString = paramsString + '&sign=' + signedParams;
    sendAlipayOrder(paramsString, 'alipay.trade.query', (result) => {
        if (result.trade_no === tradeNo) {
            if (result.trade_status === "TRADE_SUCCESS" || result.trade_status == "TRADE_FINISHED") {
                return true;
            }
            else return false;
        } else {
            return false;
        }
    })
}




//create and send transaction to alipay
exports.SendPrecreateTransaction = function (outTradeNo, cb) {
    var params = createParams("precreate", outTradeNo);
    var paramsString = makeParamsString(params);
    var sign = signWithPrivateKey(params.get('sign_type'), paramsString);
    paramsString += '&sign=' + sign;
    sendAlipayOrder(paramsString, 'alipay.trade.precreate', (result) => {
        cb(result);
    })
}

//check payment status from Alipay
exports.SendQueryTransaction = function (outTradeNo, cb) {
    var params = createParams("query", outTradeNo);
    var paramsString = makeParamsString(params);
    var sign = signWithPrivateKey(params.get('sign_type'), paramsString);
    paramsString += '&sign=' + sign;
    sendAlipayOrder(paramsString, 'alipay.trade.query', (result) => {
        cb(result);
    })
}

//verify sign of returned notice from alipay
exports.VerifyReturnNotice = function (postBody) {

    let paramsMap = buildAlipayNoticeParams(postBody);

    paramsMap = [...paramsMap].filter(([k1, v1]) => k1 !== 'sign' && k1 !== 'signType' && v1);
    paramsMap.sort();
    let paramsString = paramsMap.map(([k, v]) => `${k}=${decodeURIComponent(v)}`).join('&');

    if (!verifySign(paramsString, postBody.sign)) {
        if (queryPaymentStatus(postBody.trade_no))
            return true;
        else
            return false;
    }
    else
        return true;
}




// class Transaction {
//     constructor() {
//         this.params = new Map();
//         params.set('timestamp', moment().format('YYYY-MM-DD HH:mm:ss'));
//         params.set('app_id', config.ALIPAY_APP_ID);
//         params.set('sign_type', 'RSA2');
//         params.set('version', '1.0');
//         params.set('charset', 'utf-8');
//     };

//     BuildTransactionString() {

//     };

// }
// var trans = Transaction();


