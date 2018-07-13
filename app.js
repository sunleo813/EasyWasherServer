var express=require('express');
var app=express();
var api = require('./alipayAPI');
var qr = require('qr-image');


app.get('/', function(req, res){
    res.send("EasyTech Car Washer System");

})

app.get('/alipay', function(req,res){
    var transID=req.param('TransID');
    var result=api.genAlipayTransQRImage(transID,(result)=>{
        if (result == "Failed") {
            res.writeHead(414, {'Content-Type':'text/html'});
            res.end("<h1>Transaction failed, please use another machine.  Sorry for bringing you unconvinient </h1>");
        } else {
            var qrCode=qr.image(result,{size: 10,type:'png'})
            res.writeHead(200, {'Content-Type':'image/png'});
            qrCode.pipe(res);
        }
    });   
})

app.listen(3000, function(){
    console.log('Server running');
})