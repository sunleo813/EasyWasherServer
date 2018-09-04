var config = require('./config');
var request = require('request');


class RequestSender {

    constructor(paramString, methodType) {
        this.paramString = paramString;
        this.methodType = methodType;
        this.alipayUrl = "";
        this.replyParams = {};
    };
}

class AlipayRequestSender extends RequestSender {
    constructor(paramString, methodType) {
        super(paramString, methodType);
        this.alipayUrl = config.ALIPAY_GATEWAY + this.paramString;
    }

    sendRequest(cb) {
        console.log("requestSender-sendRequest alipayUrl: " + this.alipayUrl)
        //console.log("requetSender-paramSting: "+this.paramString)
        var that = this;
        request(this.alipayUrl, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                var JSONParams = JSON.parse(body);
                console.log("requestSender-sendRequest body: " + body);
                switch (that.methodType) {
                    case 'alipay.trade.query':
                        that.replyParams = JSONParams.alipay_trade_query_response;
                        break;
                    case 'alipay.trade.precreate':
                        that.replyParams = JSONParams.alipay_trade_precreate_response;
                        break;
                }
                //              console.log("requestSender-sendRequest replyParams: "+that.replyParams)
                if (that.replyParams.msg === "Success") {
                    cb(that.replyParams);
                } else {
                    cb("Failed");
                }
            }

        })
    }
}

export { RequestSender, AlipayRequestSender }
