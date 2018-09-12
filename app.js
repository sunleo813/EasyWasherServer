
var express = require('express');
var app = express();
var MongoAPI = require('./js/mongoAPI');
var routes = require('./routes');
var body = "";
const db = new MongoAPI();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

routes(app);

var InsertTransactionToDB = function (params) {
    var record = {
        TradeNO: params.out_trade_no,
        TotalAmount: params.total_amount,
        Subject: params.subject,
        NotifyTime: params.notify_time,
        TradeStatus: params.trade_status,
        PaymentMethod: params.paymentMethod,
        BuyerLogonID: params.buyer_logon_id,
        BuyerUserID: params.buyer_user_id
    };
    console.log('app-InsertTransactionToDB record: ' + JSON.stringify(record));
    db.AddRecord('Transactions',record);
}

var InsertCarNoToDB=function (params){
    var record={
        CarNo: params.cardNo,
        Amount: params.amount,
        LastPayDate: params.lastPayDate
    }
    db.AddRecord('CarNos',record,(result)=>{
        if(result){

        }
    });
}





app.listen(3000, function () {
    console.log('Server running');
})



