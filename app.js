var express = require('express');
var app = express();
var api = require('./alipayAPI');
var qr = require('qr-image');
var querystring = require('querystring');
var MongoAPI = require('./mongoAPI');

var body = "";
const db = new MongoAPI();

InsertTransactionToDB = function (params) {
    var record = {
        TradeNO: params.out_trade_no,
        TotalAmount: params.total_amount,
        Subject: params.subject,
        NotifyTime: params.notify_time,
        TradeStatus: params.trade_status
    };
    db.AddRecord(record);
}

app.get('/', function (req, res) {
    res.send("EasyTech Car Washer System");

})

app.get('/alipay', function (req, res) {
    var transID = req.query.TransID;
    api.SendPrecreateTransaction(transID, (result) => {
        if (result == "Failed") {
            res.writeHead(414, { 'Content-Type': 'text/html' });
            res.end("<h1>Transaction failed, please use another machine.  Sorry for bringing you unconvinient </h1>");
        } else {
            var qrCode = qr.image(result.qr_code, { size: 10, type: 'png' })
            res.writeHead(200, { 'Content-Type': 'image/png' });

            qrCode.pipe(res);
        }
    });

})

app.get('/payment_status', function (req, res) {
    var transID = req.query.TransID;
    var params = { 'TradeNO': transID };
    db.FindRecord(params, (result) => {
        if (result[0]===undefined) { res.send('failed') }
        else {
            resultObj=result[0];
            if(resultObj.TradeStatus==='TRADE_SUCCESS'){
                res.send('success')
            } else {
                res.send('failed')
            }
            
        }
    });
})


app.get('/query', function (req, res) {
    var transID = req.query.TransID;
    var result = db.FindRecord(transID);
    console.log('app-app.get:' + result);
})

app.post('/aliNotify.html', function (req, res) {
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        var postBody = querystring.parse(body);
        var verified = api.VerifyReturnNotice(postBody);
        if (!verified) {
            api.SendQueryTransaction(postBody.trade_no, (result) => {
                if (result.trade_no === postBody.trade_no && (result.trade_status === "TRADE_SUCCESS" || result.trade_status == "TRADE_FINISHED")) {
                    //add insert db here 
                    InsertTransactionToDB(postBody);
                    startService()
                } else {
                    console.log('app-app.post: Alipay query return failed');
                    return false;
                }
            })
        }
        else {
            console.log('app-app.post: Alipay reply notice verified!');
            startService();
        }
    })

    res.send('success');
})

app.listen(3000, function () {
    console.log('Server running');
})


var startService = function () {
    console.log('Washing machine start...');
}

