var qr = require('qr-image');
var querystring = require('querystring');
var moment=require('moment');

import { AliPrecreateContent, AliQueryContent, AliWapContent } from '../js/content'
import { AlipayRequestSender } from '../js/requestSender'

module.exports = function (app) {

    app.get('/alipayPrecreate', function (req, res) {
        //client provide TransID because client needs it to query for payment status later on
        let { ShopID, Amount } = req.query;
        var TransID = ShopID + "-" + moment().format('YYYYMMDDHHmmss');
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
        let { ShopID, Amount } = req.query;
        var TransID = ShopID + "-" + moment().format('YYYYMMDDHHmmss');
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

    app.get('/aliPayment_status', function (req, res) {
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

}
