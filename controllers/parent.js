const Parent = require("../models/parent");

exports.setParentUploadDir = (req, res, next) => {
  const fs = require('fs');
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
        res.status(400).json({
          error: "Not able to save parent in DB",
        });
      } else {
        parent.__v = undefined;
        parent.createdAt = undefined;
        parent.updatedAt = undefined;
        res.json(parent);
      }
    });
};

exports.updateParent = (req, res) => {
  if (req?.file?.profile_pic) {
      console.log(req.file.profile_pic.filepath, req.file.profile_pic.newFilename);
      req.body.profile_pic = `/uploads/parents/${req.file.profile_pic.newFilename}`;
    } else {
      req.body.pic_url = "";
    }
    Parent.findByIdAndUpdate(
      { _id: req.parent._id },
      { $set: req.body },
      { new: true },
      (err, parent) => {
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
              parent.salt = undefined;
              parent.password = undefined;
              parent.createdAt = undefined;
              parent.updatedAt = undefined;
              parent.__v = undefined;
              return res.json(parent);
            }
          });
        } else {
          parent.salt = undefined;
          parent.password = undefined;
          parent.createdAt = undefined;
          parent.updatedAt = undefined;
          parent.__v = undefined;
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
    res.json({
      message: `${req.parent.name} Parent Deleted Successfully`,
    });
  });
};
