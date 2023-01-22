const {unlink} = require("fs");

exports.removeFile = (path) => {
    unlink(`${__dirname}/../public${path}`,(err)=>{
        if (err){
            console.log(err);
        }else{
            console.log("Successfully deleted:",path)
        }
    })
}