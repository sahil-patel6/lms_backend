const Parent = require("../models/parent");
const fs = require("fs");
const mongoose = require("mongoose");
const Student = require("../models/student");
const {removeFile} = require("../utilities/remove_file");

exports.setParentUploadDir = (req, res, next) => {
  const dir = `${__dirname}/../public/uploads/parents/`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
  req.uploadDir = dir;
  next();
}

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

exports.createParent = (req, res) => {
    if (req?.file?.profile_pic) {
      console.log(req.file.profile_pic.filepath, req.file.profile_pic.newFilename);
      req.body.profile_pic = `/uploads/parents/${req.file.profile_pic.newFilename}`;
    } else {
      req.body.pic_url = "";
    }
    const parent = new Parent(req.body);
    parent.save((err, parent) => {
      if (err || !parent) {
        console.log(err);
        if (req.body.profile_pic){
          removeFile(req.body.profile_pic);
        }
        return res.status(400).json({
          error: "Not able to save parent in DB",
        });
      } else {
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
  if (req?.file?.profile_pic) {
    /// HERE WE CHECK IF STUDENT HAS PROFILE PIC AND IF IT DOES THEN WE REMOVE PROFILE PIC FROM FILE SYSTEM
    if (req.parent.profile_pic){
      removeFile(req.parent.profile_pic);
    }
      console.log(req.file.profile_pic.filepath, req.file.profile_pic.newFilename);
      req.body.profile_pic = `/uploads/parents/${req.file.profile_pic.newFilename}`;
    }
    Parent.findOneAndUpdate(
      { _id: req.parent._id },
      { $set: req.body },
      { new: true })
        .select("-createdAt -updatedAt -salt -password -__v")
        .exec((err, parent) => {
          if (err || !parent) {
            console.log(err);
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
                return res.json(parent);
              }
            });
          } else {
            return res.json(parent);
          }
        }
      );
};

exports.deleteParent = (req, res) => {
  Parent.deleteOne({ _id: req.parent._id }, (err, op) => {
    if (err || op.deletedCount === 0) {
      console.log(err)
      return res.status(400).json({
        error: "Failed to delete parent",
      });
    }
    return res.json({
      message: `${req.parent.name} Parent Deleted Successfully`,
    });
  });
};
