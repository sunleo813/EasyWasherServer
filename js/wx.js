var Wxpay=require('weixin-pay');
var config=require('./config');

var wxpay=new Wxpay({appid: config.WX_APPID,
    mch_id: config.WX_MCH_ID});

class WeixinManager {

    getPrepayID(order, callback){
        var param=order;
        param.body='EasyTech Washing System';
        param.detail= 'Car washing service';
        param.spbill_create_ip=config.WX_SPBILL_CREATE_IP;
 //       console.log('WeixinManager-genOrder param:'+JSON.stringify(param));
        wxpay.getBrandWCPayRequestParams(param, function(err,result){
            if(err || result["package"].prepay_id===undefined){
                callback({'msg':'failed'})
            } else {
                console.log('weixinmanager-genorder result: '+JSON.stringify(result));
                callback(result);
            }
         
        })

    }
}

module.exports=WeixinManager;

