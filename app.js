var express = require('express');
var app = express();
var api = require('./alipayAPI');
var qr = require('qr-image');
var querystring = require('querystring');
var MongoAPI = require('./mongoAPI');
var moment = require('moment');

var body = "";
const db = new MongoAPI();

InsertTransactionToDB = function (params) {
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

app.get('/alipay', function (req, res) {
    // var ShopID = req.query.ShopID;
    // var transID=ShopID+"-"+moment().format('YYYYMMDDHHmmss');
    var transID = req.query.TransID
    var amount = req.query.Amount;
    console.log(transID);
    api.SendPrecreateTransaction(transID, amount, (result) => {
        if (result == "Failed") {
            res.writeHead(414, { 'Content-Type': 'text/html' });
            res.end("<h1>Transaction failed, please use another machine.  Sorry for bringing you unconvinient </h1>");
        } else {
            console.log("app-Alipay QR code returned!");
            var qrCode = qr.image(result.qr_code, { size: 10, type: 'png' })
            res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*' });

            qrCode.pipe(res);
        }
    });

})

app.get('/payment_status', function (req, res) {
    var transID = req.query.TransID;
    var params = { 'TradeNO': transID };
    api.SendQueryTransaction(transID, (result) => {
        if (result.out_trade_no === transID) {
            console.log('aliNotify-trade status: ' + result.trade_status);
            //add insert db here 
            res.send(result.trade_status);

        } else {
            console.log('app-app.post: Alipay query return wrong out_trade_no');
            res.send('out_trade_no not correct');
        }
    })
    // db.FindRecord(params, (result) => {
    //     if (result[0] === undefined) { res.send('failed') }
    //     else {
    //         resultObj = result[0];
    //         if (resultObj.TradeStatus === 'TRADE_SUCCESS') {
    //             res.send('success')
    //         } else {
    //             res.send('failed')
    //         }

    //     }
    // });
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

app.listen(3000, function () {
    console.log('Server running');
})



