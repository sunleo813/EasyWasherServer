var WeixinManager = require('../js/wx');

module.exports = function (app) {
    const wx = new WeixinManager();
    app.get('/wxpay', function (req, res) {
        let { TransID, Amount } = req.query;
        var order = {
            out_trade_no: TransID,
            total_fee: Amount
        }
        wx.getPrepayID(order, function (result) {
            console.log(JSON.stringify(result));
        })
    })

}