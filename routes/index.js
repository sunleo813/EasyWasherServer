var aliRoutes = require('./aliRoutes');
var wxRoutes = require('./wxRoutes');

module.exports = function (app) {
  app.get('/', function (req, res) {
    //res.render('index', { title: 'EasyTech Car Washer System' })
    res.render('index');
  })

  /* Alipay Section */
  aliRoutes(app);
  /*WeChat Section */
  wxRoutes(app);


/* DB Operations */
  app.get('/query', function (req, res) {

    let { criteria, value } = req.query;
    // var criteria   = req.query.criteria;
    // var value = req.query.value;
    var params = {};
    if (criteria !== undefined) {
      // console.log('app-query criteria: ' + q);
      // console.log('app-query value: ' + v);
      switch (criteria) {
        case 'TradeNO':
          params = { 'TradeNO': value };
          break;
        case 'NotifyTime':
          params = { 'NotifyTime': value };
          break;
        case 'TradeStatus':
          params = { 'TradeStatus': value };
          break;
        default:
          params = {};
      }
    }
    // console.log('app-query params: ' + JSON.stringify(params));
    db.FindRecord(params, (result) => {
      res.send(JSON.stringify(result));
    });
  })
}
