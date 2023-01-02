const Teacher = require("../models/teacher");
const { validationResult } = require("express-validator");
const { handleForm } = require("../utilities/image_upload_and_form_handler");
exports.getTeacherById = (req, res, next, id) => {
  Teacher.findById(id).exec((err, teacher) => {
    if (err || !teacher) {
      return res.status(400).json({
        error: "No teacher Found",
      });
    }
    req.teacher = {
      ...teacher._doc,
    };
    next();
  });
};

exports.getTeacher = (req, res) => {
  req.teacher.salt = undefined;
  req.teacher.password = undefined;
  req.teacher.createdAt = undefined;
  req.teacher.updatedAt = undefined;
  req.teacher.__v = undefined;
  return res.json(req.teacher);
};

exports.createTeacher = (req, res) => {
  req.uploadDir = `${__dirname}/../public/uploads/teachers/`;
  handleForm(req, res, (fields, file) => {
    const { name, email, phone, bio, address, subjects, plainPassword } =
      fields;

    if (
      !name ||
      !email ||
      !phone ||
      !bio ||
      !address ||
      !subjects ||
      !plainPassword
    ) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }
    fields.subjects = JSON.parse(subjects);
    if (file?.profile_pic) {
      console.log(file?.profile_pic.filepath, file?.profile_pic.newFilename);
      file.path_of_image = `/uploads/teachers/${file.profile_pic.newFilename}`;
      fields.profile_pic = file.path_of_image;
    } else {
      file.path_of_image = "";
    }
    const teacher = new Teacher(fields);
    teacher.save((err, teacher) => {
      if (err || !teacher) {
        console.log(err);
        res.status(400).json({
          error: "Not able to save teacher in DB",
        });
      } else {
        teacher.__v = undefined;
        teacher.createdAt = undefined;
        teacher.updatedAt = undefined;
        res.json(teacher);
      }
    });
  });
};

exports.updateTeacher = (req, res) => {
  req.uploadDir = `${__dirname}/../public/uploads/teachers/`;
  handleForm(req, res, (fields, file) => {
    if (file?.profile_pic) {
      file.path_of_image = `/uploads/teachers/${file.profile_pic.newFilename}`;
      fields.profile_pic = file.path_of_image;
    } else {
      file.path_of_image = "";
    }
    if (fields?.subjects){
      fields.subjects = JSON.parse(subjects);
    }
    console.log(file?.profile_pic?.filepath, file?.profile_pic?.newFilename);
    console.log(fields);
    Teacher.findByIdAndUpdate(
      { _id: req.teacher._id },
      { $set: fields },
      { new: true },
      (err, teacher) => {
        if (err || !teacher) {
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
          if (!teacher.authenticate(fields.currentPassword)) {
            return res.status(400).json({
              error: "Current password is incorrect",
            });
          }
          teacher.updatePassword(fields.newPassword, (err, result) => {
            console.log(result);
            if (err || result.modifiedCount == 0) {
              console.log("Failed to update teacher password: ", err);
              return res.status(400).json({
                error: "Update failed",
              });
            } else {
              teacher.salt = undefined;
              teacher.password = undefined;
              teacher.createdAt = undefined;
              teacher.updatedAt = undefined;
              teacher.__v = undefined;
              return res.json(teacher);
            }
          });
        } else {
          console.log("NO need to update password")
          teacher.salt = undefined;
          teacher.password = undefined;
          teacher.createdAt = undefined;
          teacher.updatedAt = undefined;
          teacher.__v = undefined;
          return res.json(teacher);
        }
      }
    );
  });
};

exports.deleteTeacher = (req, res) => {
  Teacher.deleteOne({ _id: req.teacher._id }, (err, op) => {
    if (err || op.deletedCount == 0) {
      console.log(err)
      return res.status(400).json({
        error: "Failed to delete Teacher",
      });
    }
    res.json({
      message: `${req.teacher.name} Teacher Deleted Successfully`,
    });
  });
};
