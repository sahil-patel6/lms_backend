const {validationResult} = require("express-validator");

exports.validateAllErrors = (req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            // errors: errors.array().map((prop,msg)=>{
            //     return {param: prop.param,msg: prop.msg}
            // }),
            error: errors.array()[0].msg
        });
    }
    next()
}