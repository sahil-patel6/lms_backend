const Student = require("../models/student");
const Subject = require("../models/subject");

exports.setStudentUploadDir = (req, res, next) => {
  const fs = require('fs');
  const dir = `${__dirname}/../public/uploads/students/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
  req.uploadDir = dir;
  next();
}

exports.getStudentById = (req, res, next, id) => {
  Student.findById(id).exec((err, student) => {
    if (err || !student) {
      return res.status(400).json({
        error: "No student Found",
      });
    }
    req.student = {
      ...student._doc,
    };
    next();
  });
};

exports.getStudent = (req, res) => {
  req.student.salt = undefined;
  req.student.password = undefined;
  req.student.createdAt = undefined;
  req.student.updatedAt = undefined;
  req.student.__v = undefined;
  return res.json(req.student);
};

exports.getAllStudentsBySemester = (req, res) => {
  Student.find({ semester: req.params.semesterId })
      // .populate({ path: "semester", select: "-__v -createdAt -updatedAt" })
      .populate('semester', "_id name")
      // .populate({ path: "department", select: "-__v -createdAt -updatedAt" })
      .populate('department',"_id name")
      .select("-createdAt -updatedAt -salt -password -__v")
      .exec((err, students) => {
        if (err || !students) {
          console.log(err);
          res.status(400).json({
            error:
                "An error occurred while trying to find all subjects from db " +
                err,
          });
        } else {
          return res.json({students});
        }
      });
};

exports.createStudent = (req, res) => {
  if (req?.file?.profile_pic) {
    console.log(req.file.profile_pic.filepath, req.file.profile_pic.newFilename);
    req.body.profile_pic = `/uploads/students/${req.file.profile_pic.newFilename}`;
  } else {
    req.body.pic_url = "";
  }

  const student = new Student(req.body);
    student.save((err, student) => {
      if (err || !student) {
        console.log(err);
        res.status(400).json({
          error: "Not able to save student in DB",
        });
      } else {
        student.__v = undefined;
        student.createdAt = undefined;
        student.updatedAt = undefined;
        student.password = undefined;
        student.salt = undefined;
        res.json(student);
      }
    });
};

exports.updateStudent = (req, res) => {
  if (req?.file?.profile_pic) {
    console.log(req.file.profile_pic.filepath, req.file.profile_pic.newFilename);
    req.body.profile_pic = `/uploads/students/${req.file.profile_pic.newFilename}`;
  }
  Student.findByIdAndUpdate(
      { _id: req.student._id },
      { $set: req.body },
      { new: true })
      .select("-createdAt -updatedAt -salt -password -__v")
      .exec((err, student) => {
        if (err || !student) {
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
          if (!student.authenticate(req.body.currentPassword)) {
            return res.status(400).json({
              error: "Current password is incorrect",
            });
          }
          student.updatePassword(req.body.newPassword, (err, result) => {
            if (err || result.modifiedCount === 0) {
              console.log("Failed to update student password: ", err);
              return res.status(400).json({
                error: "Update failed",
              });
            } else {
              return res.json(student);
            }
          });
        } else {
          return res.json(student);
        }
      }
    );
};

exports.deleteStudent = (req, res) => {
  Student.deleteOne({ _id: req.student._id }, (err, op) => {
    if (err || op.deletedCount === 0) {
      console.log(err)
      return res.status(400).json({
        error: "Failed to delete student",
      });
    }
    res.json({
      message: `${req.student.name} Student Deleted Successfully`,
    });
  });
};
