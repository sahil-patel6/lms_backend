const Student = require("../models/student");
const { handleForm } = require("../utilities/image_upload_and_form_handler");
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

exports.createStudent = (req, res) => {
  req.uploadDir = `${__dirname}/../public/uploads/students/`;
  handleForm(req, res, (fields, file) => {
    const { name, email, phone, bio, address, semester,department, roll_number, plainPassword } =
      fields;

    if (
      !name ||
      !email ||
      !phone ||
      !bio ||
      !address ||
      !semester ||
      !department ||
      !roll_number ||
      !plainPassword
    ) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }
    if (file?.profile_pic) {
      console.log(file?.profile_pic.filepath, file?.profile_pic.newFilename);
      file.path_of_image = `/uploads/students/${file.profile_pic.newFilename}`;
      fields.profile_pic = file.path_of_image;
    } else {
      file.path_of_image = "";
    }
    const student = new Student(fields);
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
        res.json(student);
      }
    });
  });
};

exports.updateStudent = (req, res) => {
  req.uploadDir = `${__dirname}/../public/uploads/students/`;
  handleForm(req, res, (fields, file) => {
    if (file?.profile_pic) {
      file.path_of_image = `/uploads/students/${file.profile_pic.newFilename}`;
      fields.profile_pic = file.path_of_image;
    } else {
      file.path_of_image = "";
    }
    console.log(file?.profile_pic?.filepath, file?.profile_pic?.newFilename);
    console.log(fields);
    Student.findByIdAndUpdate(
      { _id: req.student._id },
      { $set: fields },
      { new: true },
      (err, student) => {
        if (err || !student) {
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
          if (!student.authenticate(fields.currentPassword)) {
            return res.status(400).json({
              error: "Current password is incorrect",
            });
          }
          student.updatePassword(fields.newPassword, (err, result) => {
            if (err || result.modifiedCount == 0) {
              console.log("Failed to update student password: ", err);
              return res.status(400).json({
                error: "Update failed",
              });
            } else {
              student.salt = undefined;
              student.password = undefined;
              student.createdAt = undefined;
              student.updatedAt = undefined;
              student.__v = undefined;
              return res.json(student);
            }
          });
        } else {
          student.salt = undefined;
          student.password = undefined;
          student.createdAt = undefined;
          student.updatedAt = undefined;
          student.__v = undefined;
          return res.json(student);
        }
      }
    );
  });
};

exports.deleteStudent = (req, res) => {
  Student.deleteOne({ _id: req.student._id }, (err, op) => {
    if (err || op.deletedCount == 0) {
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
