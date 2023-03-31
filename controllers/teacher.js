const Teacher = require("../models/teacher");
const fs = require("fs");
const { removeFile } = require("../utilities/remove_file");
const agenda = require("../agenda");

exports.setTeacherUploadDir = (req, res, next) => {
  const dir = `${__dirname}/../public/uploads/teachers/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  req.uploadDir = dir;
  next();
};

exports.getTeacherById = (req, res, next, id) => {
  Teacher.findById(id)
    .populate("subjects", "_id name")
    .exec((err, teacher) => {
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


exports.getAllTeachers = (req, res) => {
  Teacher.find()
    .populate("subjects", "_id name")
    .select("-salt -password -fcm_token -fcs_profile_path -__v -createdAt -updatedAt")
    .exec((err, teachers) => {
      if (err || !teachers) {
        return res.status(400).json({
          error: "No teachers Found",
        });
      }
      return res.json(teachers);
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
  // if (req?.file?.profile_pic) {
  //     console.log(req.file.profile_pic.filepath, req.file.profile_pic.newFilename);
  //     req.body.profile_pic = `/uploads/teachers/${req.file.profile_pic.newFilename}`;
  // } else {
  //     req.body.pic_url = "";
  // }
  const teacher = new Teacher(req.body);
  teacher.save((err, teacher) => {
    if (err || !teacher) {
      console.log(err);
      // if (req.body.profile_pic){
      //     removeFile(req.body.profile_pic);
      // }
      if (req.body.fcs_profile_pic_path) {
        removeFile(req.body.fcs_profile_pic_path);
      }
      return res.status(400).json({
        error: "Not able to save teacher in DB",
      });
    } else {
      agenda.now("send user credentials email", {
        name: teacher.name,
        email: teacher.email,
        password: req.body.plainPassword,
      });
      teacher.__v = undefined;
      teacher.createdAt = undefined;
      teacher.updatedAt = undefined;
      teacher.password = undefined;
      teacher.salt = undefined;
      return res.json(teacher);
    }
  });
};

exports.updateTeacher = (req, res) => {
  //   if (req?.file?.profile_pic) {
  //     /// HERE WE CHECK IF TEACHER HAS PROFILE PIC AND IF IT DOES THEN WE REMOVE PROFILE PIC FROM FILE SYSTEM
  //     if (req.teacher.profile_pic) {
  //       removeFile(req.teacher.profile_pic);
  //     }
  //     console.log(
  //       req.file.profile_pic.filepath,
  //       req.file.profile_pic.newFilename
  //     );
  //     req.body.profile_pic = `/uploads/teachers/${req.file.profile_pic.newFilename}`;
  //   }
  Teacher.findOneAndUpdate(
    { _id: req.teacher._id },
    { $set: req.body },
    { new: true }
  )
    .select("-createdAt -updatedAt -__v")
    .exec((err, teacher) => {
      if (err || !teacher) {
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
        if (!teacher.authenticate(req.body.currentPassword)) {
          return res.status(400).json({
            error: "Current password is incorrect",
          });
        }
        teacher.updatePassword(req.body.newPassword, (err, result) => {
          if (err || result.modifiedCount === 0) {
            console.log("Failed to update teacher password: ", err);
            return res.status(400).json({
              error: "Update failed",
            });
          } else {
            teacher.password = undefined;
            teacher.salt = undefined;
            return res.json(teacher);
          }
        });
      } else {
        console.log("NO need to update teacher password");
        teacher.password = undefined;
        teacher.salt = undefined;
        return res.json(teacher);
      }
    });
};

exports.deleteTeacher = (req, res) => {
  Teacher.deleteOne({ _id: req.teacher._id }, (err, op) => {
    if (err || op.deletedCount === 0) {
      console.log(err);
      return res.status(400).json({
        error: "Failed to delete Teacher",
      });
    }
    return res.json({
      message: `${req.teacher.name} Teacher Deleted Successfully`,
    });
  });
};
