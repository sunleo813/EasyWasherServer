var assert = require('chai').assert;
//var Content = require('../js/content');
//var AliPrecreateContent = require('../js/content');
// 
import MongoDB from '../js/mongoAPI'

describe('mongoDB', function () {
    describe('#makeConnection', function () {
        it('should return db object ', function () {
            let mongo = new MongoDB;
            mongo.makeConnection(function(dbo){
                assert.exists(dbo);
            })
        });
    });
});


