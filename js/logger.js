var fs=require('fs');

exports=function(source,err, result){
    if(err)
        console.log(source +' '+err);
    else{
        console.log(source+' '+result);
    }
}