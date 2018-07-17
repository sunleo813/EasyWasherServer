var express = require('express');
var app = express();
var api = require('./alipayAPI');
var qr = require('qr-image');
var querystring = require('querystring');

var body = "";

app.get('/', function (req, res) {
    res.send("EasyTech Car Washer System");

})

app.get('/alipay', function (req, res) {
    var transID = req.query.TransID;
    var result = api.genAlipayTransQRImage(transID, (result) => {
        if (result == "Failed") {
            res.writeHead(414, { 'Content-Type': 'text/html' });
            res.end("<h1>Transaction failed, please use another machine.  Sorry for bringing you unconvinient </h1>");
        } else {
            var qrCode = qr.image(result, { size: 10, type: 'png' })
            res.writeHead(200, { 'Content-Type': 'image/png' });
            qrCode.pipe(res);
        }
    });
})

app.post('/aliNotify.html', function (req, res) {
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        //console.log(body);
        var postBody = querystring.parse(body);
        //console.log(postBody.notify_time);
        //api.buildAlipayNoticeParams(postBody);
        var result = api.verifyReturnNotice(postBody);
        console.log('verify result: ' + result);
        if (result) {
            startService();
        } else {
            console.log('fail to verify sign');
        }
    })
    // if(postBody.trade_status==='TRADE_SUCCESS'|| postBody.trade_status==='TRADE_FINISHED' || postBody.trade_status==='TRADE_CLOSED')
    res.send('success');
})

app.listen(3000, function () {
    console.log('Server running');
})


var startService = function () {
    console.log('Washing machine start...');
}

