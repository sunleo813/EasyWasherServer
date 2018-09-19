
var express = require('express');
var app = express();
var routes = require('./routes');
var path=require('path');



app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

routes(app);

app.listen(3000, function () {
    console.log('Server running');
})



