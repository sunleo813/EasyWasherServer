
var express = require('express');
var app = express();
var qr = require('qr-image');
var querystring = require('querystring');
var MongoAPI = require('./js/mongoAPI');
//var moment = require('moment');


//var AliPrecreateContent = require('./js/content');
import { AliPrecreateContent, AliQueryContent, AliWapContent } from './js/content'
import { AlipayRequestSender } from './js/requestSender'

var body = "";
const db = new MongoAPI();

var InsertTransactionToDB = function (params) {
    var record = {
        TradeNO: params.out_trade_no,
        TotalAmount: params.total_amount,
        Subject: params.subject,
        NotifyTime: params.notify_time,
        TradeStatus: params.trade_status,
        PaymentMethod: 'Alipay',
        BuyerLogonID: params.buyer_logon_id,
        BuyerUserID: params.buyer_user_id
    };
    console.log('app-InsertTransactionToDB record: ' + JSON.stringify(record));
    db.AddRecord(record);

}

app.get('/', function (req, res) {
    res.send("EasyTech Car Washer System");

})

/* Alipay Section */

app.get('/alipayPrecreate', function (req, res) {
    //client provide TransID because client needs it to query for payment status later on
    let { TransID, Amount } = req.query;
    // var TransID = ShopID + "-" + moment().format('YYYYMMDDHHmmss');
    //console.log(TransID);
    var content = new AliPrecreateContent(TransID, Amount);
    var paramsString = content.build();
    //console.log(paramsString);
    var sender = new AlipayRequestSender(paramsString, 'precreate');
    sender.sendRequest(function (result) {
        if (result == "Failed") {
            res.writeHead(414, { 'Content-Type': 'text/html' });
            res.end("<h1>Transaction failed, please use another machine.  Sorry for bringing you unconvinient </h1>");
        } else {
            console.log("app-Alipay QR code returned!");
            var qrCode = qr.image(result.qr_code, { size: 10, type: 'png' })
            res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*' });

            qrCode.pipe(res);
        }
    })

})

app.get('/alipayWapTrade', function (req, res) {
    let { TransID, Amount } = req.query;
    var content = new AliWapContent(TransID, Amount);
    var paramsString = content.build();
    //console.log(paramsString);
    var sender = new AlipayRequestSender(paramsString, 'wap_pay');
    sender.sendRequest(function (result) {
        if (result) {
            console.log("Alipay_Wap_Trade returned!");
            console.log(result)
            //           res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8'});
            res.send(result);
        } else {
            // res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
            res.end('Alipay_Wap_Trade error')
        }
    })

})

app.get('/payment_status', function (req, res) {
    var transID = req.query.TransID;
    var content = new AliQueryContent(transID);
    var paramsString = content.build();
    //console.log('app-payment_status paramsString: '+paramsString)
    var sender = new AlipayRequestSender(paramsString, 'query');
    sender.sendRequest(function (result) {
        if (result.out_trade_no === transID && result.trade_status === "TRADE_SUCCESS")
            var returnString = "success";
        else
            var returnString = "fail";
        res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
        return res.end(returnString);
    })
})




app.get('/query', function (req, res) {

    var q = req.query.criteria;
    var v = req.query.value;
    var params = {};
    if (q !== undefined) {
        // console.log('app-query criteria: ' + q);
        // console.log('app-query value: ' + v);
        switch (q) {
            case 'TradeNO':
                params = { 'TradeNO': v };
                break;
            case 'NotifyTime':
                params = { 'NotifyTime': v };
                break;
            case 'TradeStatus':
                params = { 'TradeStatus': v };
                break;
            default:
                params = {};
        }
    }
    // console.log('app-query params: ' + JSON.stringify(params));
    db.FindRecord(params, (result) => {
        res.send(JSON.stringify(result));
    });
})

app.post('/aliNotify.html', function (req, res) {
    console.log('app-aliNotify got notice from aliay');
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        var postBody = querystring.parse(body);
        var verified = api.VerifyReturnNotice(postBody);
        if (!verified) {
            api.SendQueryTransaction(postBody.out_trade_no, (result) => {
                if (result.trade_no === postBody.trade_no && (result.trade_status === "TRADE_SUCCESS" || result.trade_status == "TRADE_FINISHED")) {
                    console.log('aliNotify-trade status: ' + result.trade_status);
                    //add insert db here 
                    InsertTransactionToDB(postBody);
                } else {
                    console.log('app-app.post: Alipay query return failed');
                    return false;
                }
            })
        }
        else {
            console.log('app-app.post: Alipay reply notice verified!');

        }
    })

    res.send('success');
})



/* WxPay Section */

app.get('/wxpay', function (req, res) {

})


app.listen(3000, function () {
    console.log('Server running');
})



