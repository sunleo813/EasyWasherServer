var config = require('./config');
var request = require('request');


class AlipayRequestSender {

    constructor(paramString, methodType) {
        this.paramString = paramString;
        this.methodType = methodType;
        this.alipayUrl = config.ALIPAY_GATEWAY + this.paramString;
        this.replyParams = {};
    }

    sendRequest(cb) {
 //       console.log(this.methodType)
  //      console.log("AlipayRequestSender-sendRequest alipayUrl: " + this.alipayUrl)
        //console.log("requetSender-paramSting: "+this.paramString)
        var that = this;
        request(this.alipayUrl, function (error, res, body) {
 //           console.log('AlipayRequestSender-request that.methodType: '+that.methodType)
  //          console.log("AlipayRequestSender-request body: " + body);
            if(that.methodType=="wap_pay"){
                cb(body);
            } else {
                if (!error && res.statusCode == 200) {
                    var JSONParams = JSON.parse(body);
    
                    that.replyParams=JSONParams['alipay_trade_'+that.methodType+'_response'];
                }
     //           console.log('AlipayRequestSender-sendRequest replyParams: '+JSON.stringify(that.replyParams))
                if (that.replyParams.msg === "Success") {
                    cb(that.replyParams);
                } else {
                    cb("Failed");
                }
            }

        })
    }
}

export { AlipayRequestSender }
