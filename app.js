var express=require('express');
var app=express();
var api = require('./alipayAPI');


app.get('/', function(req, res){
    res.send("EasyTech Car Washer System");

})

app.get('/alipay', function(req,res){
    var transID=req.param('TransID');
    //console.log(transID);
    // var img=api.genAlipayTransQRImage(transID);
    // res.writeHead(200, {'content-type':'image/png'});
    // img.pipe(res);
    var result=api.genAlipayTransQRImage(transID);
    res.send(result);
    
})
app.listen(3000, function(){
    console.log('Server running');
});