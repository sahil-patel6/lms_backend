const Parent = require("../models/parent");
const { removeFile } = require("../utilities/remove_file");
const agenda = require("../agenda");

exports.getParentById = (req, res, next, id) => {
  Parent.findById(id).exec((err, parent) => {
    if (err || !parent) {
      return res.status(400).json({
        error: "No parent Found",
      });
    }
    req.parent = {
      ...parent._doc,
    };
    next();
  });
};

exports.getParent = (req, res) => {
  req.parent.salt = undefined;
  req.parent.password = undefined;
  req.parent.createdAt = undefined;
  req.parent.updatedAt = undefined;
  req.parent.__v = undefined;
  return res.json(req.parent);
};

exports.getAllParents = (req, res) => {
  Parent.find()
    .populate("students", "_id name profile_pic")
    .select(
      "-salt -password -fcm_token -fcs_profile_path -__v -createdAt -updatedAt"
    )
    .exec((err, parents) => {
      if (err || !parents) {
        return res.status(400).json({
          error: "No parent Found",
        });
      }
      res.json(parents);
    });
};

exports.createParent = (req, res) => {
  // if (req?.file?.profile_pic) {
  //   console.log(req.file.profile_pic.filepath, req.file.profile_pic.newFilename);
  //   req.body.profile_pic = `/uploads/parents/${req.file.profile_pic.newFilename}`;
  // } else {
  //   req.body.pic_url = "";
  // }
  const parent = new Parent(req.body);
  parent.save((err, parent) => {
    if (err || !parent) {
      console.log(err);
      // if (req.body.profile_pic) {
      //   removeFile(req.body.profile_pic);
      // }
      if (req.body.fcs_profile_pic_path) {
        removeFile(req.body.fcs_profile_pic_path);
      }
      /// THIS CODE MEANS THERE IS A DUPLICATE KEY
      if (err.code === 11000){
        const key = Object.keys(err.keyValue);
        const value = Object.values(err.keyValue);
        console.log(Object.keys(err.keyValue))
        console.log(Object.values(err.keyValue))
        return res.status(400).json({
          error: `${key[0]} already exists`
        })
      }
      return res.status(400).json({
        error: "Not able to save parent in DB",
      });
    } else {
      agenda.now("send user credentials email", {
        name: parent.name,
        email: parent.email,
        password: req.body.plainPassword,
      });
      parent.__v = undefined;
      parent.createdAt = undefined;
      parent.updatedAt = undefined;
      parent.password = undefined;
      parent.salt = undefined;
      return res.json(parent);
    }
  });
};

exports.updateParent = (req, res) => {
  // if (req?.file?.profile_pic) {
  //   /// HERE WE CHECK IF STUDENT HAS PROFILE PIC AND IF IT DOES THEN WE REMOVE PROFILE PIC FROM FILE SYSTEM
  //   if (req.parent.profile_pic){
  //     removeFile(req.parent.profile_pic);
  //   }
  //     console.log(req.file.profile_pic.filepath, req.file.profile_pic.newFilename);
  //     req.body.profile_pic = `/uploads/parents/${req.file.profile_pic.newFilename}`;
  //   }
  Parent.findOneAndUpdate(
    { _id: req.parent._id },
    { $set: req.body },
    { new: true }
  )
    .select("-createdAt -updatedAt -__v")
    .exec((err, parent) => {
      if (err || !parent) {
        console.log(err);
        /// THIS CODE MEANS THERE IS A DUPLICATE KEY
        if (err.code === 11000){
          const key = Object.keys(err.keyValue);
          const value = Object.values(err.keyValue);
          console.log(Object.keys(err.keyValue))
          console.log(Object.values(err.keyValue))
          return res.status(400).json({
            error: `${key[0]} already exists`
          })
        }
        return res.status(400).json({
          error: "Update failed",
        });
      }
      if (
        req.body.newPassword &&
        req.body.newPassword.length >= 8 &&
        req.body.currentPassword
      ) {
        // if(fields.plainPassword){
        if (!parent.authenticate(req.body.currentPassword)) {
          return res.status(400).json({
            error: "Current password is incorrect",
          });
        }
        parent.updatePassword(req.body.newPassword, (err, result) => {
          if (err || result.modifiedCount === 0) {
            console.log("Failed to update parent password: ", err);
            return res.status(400).json({
              error: "Update failed",
            });
          } else {
            parent.password = undefined;
            parent.salt = undefined;
            return res.json(parent);
          }
        });
      } else {
        parent.password = undefined;
        parent.salt = undefined;
        return res.json(parent);
      }
    });
};

exports.deleteParent = (req, res) => {
  Parent.deleteOne({ _id: req.parent._id }, (err, op) => {
    if (err || op.deletedCount === 0) {
      console.log(err);
      return res.status(400).json({
        error: "Failed to delete parent",
      });
    }
    return res.json({
      message: `${req.parent.name} Parent Deleted Successfully`,
    });
  });
};
