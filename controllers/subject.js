const Subject = require("../models/subject");
const Semester = require("../models/semester");
const { handleForm } = require("../utilities/image_upload_and_form_handler");

exports.getSubjectById = (req, res, next, id) => {
  Subject.findById(id)
    .populate({ path: "semester", select: "-__v -createdAt -updatedAt" })
    .populate({ path: "department", select: "-__v -createdAt -updatedAt" })
    // .populate({ path: "lessons", select: "-__v -createdAt -updatedAt" })
    // .populate({ path: "assignments", select: "-__v -createdAt -updatedAt" })
    .exec((err, subject) => {
      if (err || !subject) {
        return res.status(400).json({
          error: "No subject Found",
        });
      }
      subject._doc.createdAt = undefined;
      subject._doc.updatedAt = undefined;
      req.subject = subject._doc;
      next();
    });
};

exports.getSubject = (req, res) => {
  req.subject.__v = undefined;
  return res.json(req.subject);
};

exports.getAllSubjectsBySemester = (req, res) => {
  Subject.find({ semester: req.params.semesterId })
    .populate({ path: "semester", select: "-__v -createdAt -updatedAt" })
    .populate({ path: "department", select: "-__v -createdAt -updatedAt" })
    // .populate({ path: "lessons", select: "-__v -createdAt -updatedAt" })
    // .populate({ path: "assignments", select: "-__v -createdAt -updatedAt" })
    .exec((err, subjects) => {
      if (err || !subjects) {
        console.log(err);
        res.status(400).json({
          error:
            "An error occurred while trying to find all subjects from db " +
            err,
        });
      } else {
        return res.json(
          subjects.map((subject) => {
            subject.createdAt = undefined;
            subject.__v = undefined;
            subject.updatedAt = undefined;
            return subject;
          })
        );
      }
    });
};

exports.createSubject = (req, res) => {
  req.uploadDir = `${__dirname}/../public/uploads/subjects/`;
  handleForm(req, res, (fields, file) => {
    const { name, credits, department, semester } = fields;

    if (!name || !credits || !department || !semester) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }
    if (file?.pic_url){
      console.log(file.pic_url.filepath, file.pic_url.newFilename);
      file.path_of_image = `/uploads/subjects/${file.pic_url.newFilename}`;
      fields.pic_url = file.path_of_image;
    }else{
      file.path_of_image = "";
    }
    const subject = new Subject(fields);
    subject.save((err, subject) => {
      if (err || !subject) {
        console.log(err);
        res.status(400).json({
          error: "Not able to save subject in DB",
        });
      } else {
        Semester.updateOne(
          { _id: subject.semester },
          { $push: { subjects: subject._id } },
          (err, op) => {
            if (err || op.modifiedCount == 0) {
              console.log(err);
              res.status(400).json({
                error: "Not able to save subject in semester",
              });
            } else {
              subject.__v = undefined;
              subject.createdAt = undefined;
              subject.updatedAt = undefined;
              res.json(subject);
            }
          }
        );
      }
    });
  });
};

exports.updateSubject = (req, res) => {
  req.uploadDir = `${__dirname}/../public/uploads/subjects/`;
  handleForm(req, res, (fields, file) => {
    if (file.pic_url){
      file.path_of_image = `/uploads/subjects/${file.pic_url.newFilename}`;
      fields.pic_url = file.path_of_image;
    }else{
      file.path_of_image = "";
    }
    console.log(file?.pic_url?.filepath, file?.pic_url?.newFilename);
    Subject.findByIdAndUpdate(
      { _id: req.subject._id },
      { $set: fields},
      { new: true },
      (err, subject) => {
        if (err || !subject) {
          return res.status(400).json({
            error: "Update failed",
          });
        }
        subject.__v = undefined;
        return res.json(subject);
      }
    );
  });
};

exports.deleteSubject = (req, res) => {
  Subject.deleteOne({ _id: req.subject._id }, (err, removedSubject) => {
    if (err || removedSubject.deletedCount == 0) {
      return res.status(400).json({
        error: "Failed to delete Subject",
      });
    }
    Semester.updateOne(
      { _id: req.subject.semester },
      { $pull: { subjects: req.subject._id } },
      (err, op) => {
        if (err || op.modifiedCount == 0) {
          console.log(err);
          res.status(400).json({
            error: "Failed to delete Subject from Semester",
          });
        } else {
          res.json({
            message: `${req.subject.name} Subject Deleted Successfully`,
          });
        }
      }
    );
  });
};
