var db = require('./mongoAPI');
var logger=require('./logger');



function InsertTransactionToDB(params) {
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
    db.AddRecord('Transactions', record, (err,result)=>{
       logger('InsertTransactionToDB',err,result);
    });
}

function InsertCarNoToDB(params) {
    var record = {
        CarNo: params.cardNo,
        Amount: params.amount,
        LastPayDate: params.lastPayDate
    }
    db.AddRecord('CarNos', record, (err, result) => {
        logger('InsertCarNoToDB',err,result);
    });
}





module.exports = DBOper;

