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
    api.SendPrecreateTransaction(transID,(result)=>{
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

app.post('/aliNotify.html', function (req, res) {
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        var postBody = querystring.parse(body);
        var verified = api.VerifyReturnNotice(postBody);
        if(!verified){
            api.SendQueryTransaction(postBody.trade_no,(result)=>{
                if (result.trade_no === postBody.trade_no && (result.trade_status === "TRADE_SUCCESS" || result.trade_status == "TRADE_FINISHED")) {
                    startService()   
                } else {
                    console.log('fail to verify sign');
                    return false;
                }
            })
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

