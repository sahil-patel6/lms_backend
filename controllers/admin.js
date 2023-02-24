const Admin = require("../models/admin");

exports.getAdminById = (req, res, next, id) => {
    Admin.findById(id).exec((err, admin) => {
        if (err || !admin) {
            return res.status(400).json({
                error: "No admin Found",
            });
        }
        req.admin = {
            ...admin._doc,
        };
        next();
    });
};

exports.getAdmin = (req, res) => {
    req.admin.salt = undefined;
    req.admin.password = undefined;
    req.admin.__v = undefined;
    req.admin.createdAt = undefined;
    req.admin.updatedAt = undefined;
    return res.json(req.admin);
};

exports.getAllAdmins = (req,res) => {
    Admin.find().select("-createdAt -updatedAt -salt -password -__v").exec((err,admins)=>{
        if (err || !admins) {
            console.log(err);
            return res.status(400).json({
                error: "An error occurred while trying to find all admin from db " + err,
            });
        }else{
            return res.json(admins);
        }
    })
}

exports.createAdmin = (req,res) =>{
    const admin = new Admin(req.body);
    admin.save((err, admin) => {
        if (err || !admin) {
            console.log(err);
            return res.status(400).json({
                error: "Not able to save admin in DB",
            });
        } else {
            admin.password = undefined;
            admin.createdAt = undefined;
            admin.updatedAt = undefined;
            admin.salt = undefined;
            admin.__v = undefined;
            return res.json({admin});
        }
    });
}

exports.updateAdmin = (req, res) => {
    Admin.findOneAndUpdate(
        { _id: req.admin._id },
        { $set: req.body },
        {new: true})
        .select("-__v -createdAt -updatedAt")
        .exec((err, admin) => {
            if (err || !admin) {
                return res.status(400).json({
                    error: "Update failed",
                });
            }
            if(req.body.newPassword && req.body.newPassword.length>=8 && req.body.currentPassword){
            // if(req.body.plainPassword){
                if(!admin.authenticate(req.body.currentPassword)){
                    return res.status(400).json({
                        error: "Current password is incorrect"
                    })
                }
                admin.updatePassword(req.body.newPassword, (err,result)=>{
                    if (err || result.modifiedCount === 0){
                        console.log("Failed to update admin password: ",err);
                        return res.status(400).json({
                            error: "Update failed",
                        });
                    }else{
                        admin.password = undefined;
                        admin.salt = undefined;
                        return res.json(admin);
                    }
                }); 
            }else{
                admin.password = undefined;
                admin.salt = undefined;
                return res.json(admin);
            }
        }
    );
};


exports.deleteAdmin = (req, res) => {
    Admin.deleteOne({_id: req.admin._id},(err, removedAdmin) => {
        if (err || removedAdmin.deletedCount === 0) {
            return res.status(400).json({
                error: "Failed to delete admin",
            });
        }
        return res.json({
            message: `${req.admin.name} Admin Deleted Successfully`,
        });
    });
};