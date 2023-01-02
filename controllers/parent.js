const Parent = require("../models/parent");
const { handleForm } = require("../utilities/image_upload_and_form_handler");
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
    console.log(parent._doc);
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
  req.uploadDir = `${__dirname}/../public/uploads/parents/`;
  handleForm(req, res, (fields, file) => {
    const { name, email, phone, bio, address, students, plainPassword } =
      fields;

    if (
      !name ||
      !email ||
      !phone ||
      !bio ||
      !address ||
      !students ||
      !plainPassword
    ) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }

    fields.students = JSON.parse(students);
    if (file?.profile_pic) {
      console.log(file?.profile_pic.filepath, file?.profile_pic.newFilename);
      file.path_of_image = `/uploads/parents/${file.profile_pic.newFilename}`;
      fields.profile_pic = file.path_of_image;
    } else {
      file.path_of_image = "";
    }
    const parent = new Parent(fields);
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
  });
};

exports.updateParent = (req, res) => {
  req.uploadDir = `${__dirname}/../public/uploads/parents/`;
  handleForm(req, res, (fields, file) => {
    if (file?.profile_pic) {
      file.path_of_image = `/uploads/subjects/${file.profile_pic.newFilename}`;
      fields.profile_pic = file.path_of_image;
    } else {
      file.path_of_image = "";
    }
    console.log(file?.profile_pic?.filepath, file?.profile_pic?.newFilename);

    Parent.findByIdAndUpdate(
      { _id: req.parent._id },
      { $set: fields },
      { new: true },
      (err, parent) => {
        if (err || !parent) {
          console.log(err);
          return res.status(400).json({
            error: "Update failed",
          });
        }
        if (
          fields.newPassword &&
          fields.newPassword.length >= 8 &&
          fields.currentPassword
        ) {
          // if(fields.plainPassword){
          if (!parent.authenticate(fields.currentPassword)) {
            return res.status(400).json({
              error: "Current password is incorrect",
            });
          }
          parent.updatePassword(fields.newPassword, (err, result) => {
            if (err || result.modifiedCount == 0) {
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
  });
};

exports.deleteParent = (req, res) => {
  Parent.deleteOne({ _id: req.parent._id }, (err, op) => {
    if (err || op.deletedCount == 0) {
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
