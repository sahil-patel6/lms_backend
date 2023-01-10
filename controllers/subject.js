const Subject = require("../models/subject");
const Semester = require("../models/semester");
const fs = require("fs");

exports.setSubjectUploadDir = (req, res, next)=>{
    const fs = require('fs');
    const dir = `${__dirname}/../public/uploads/subjects/`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
    req.uploadDir = dir;
    next();
}

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
      req.subject = subject._doc;
      next();
    });
};

exports.getSubject = (req, res) => {
  req.subject.__v = undefined;
  req.subject.createdAt = undefined;
  req.subject.updatedAt = undefined;
  return res.json(req.subject);
};

exports.getAllSubjectsBySemester = (req, res) => {
  Subject.find({ semester: req.params.semesterId })
    // .populate({ path: "semester", select: "-__v -createdAt -updatedAt" })
    .populate('semester', "_id name")
    // .populate({ path: "department", select: "-__v -createdAt -updatedAt" })
    .populate('department',"_id name")
    // .populate({ path: "lessons", select: "-__v -createdAt -updatedAt" })
    // .populate({ path: "assignments", select: "-__v -createdAt -updatedAt" })
      .select("-createdAt -updatedAt -__v")
      .exec((err, subjects) => {
      if (err || !subjects) {
        console.log(err);
        res.status(400).json({
          error:
            "An error occurred while trying to find all subjects from db " +
            err,
        });
      } else {
        return res.json({subjects});
      }
    });
};

exports.createSubject = (req, res,next) => {
    if (req?.file?.pic_url){
      console.log(req.file.pic_url.filepath, req.file.pic_url.newFilename);
      req.body.pic_url = `/uploads/subjects/${req.file.pic_url.newFilename}`;
    }else{
      req.body.pic_url = "";
    }
    const subject = new Subject(req.body);
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
            if (err || op.modifiedCount === 0) {
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
}

exports.updateSubject = (req, res) => {
    if (req?.file?.pic_url){
      req.body.pic_url = `/uploads/subjects/${req.file.pic_url.newFilename}`;
    }else{
      req.body.pic_url = "";
    }
    console.log(req.file?.pic_url?.filepath, req.file?.pic_url?.newFilename);
    Subject.findByIdAndUpdate(
      { _id: req.subject._id },
      { $set: req.body},
      { new: true })
        .select("-createdAt -updatedAt -__v")
        .exec((err, subject) => {
        if (err || !subject) {
          return res.status(400).json({
            error: "Update failed",
          });
        }
        return res.json(subject);
      }
    );
};

exports.deleteSubject = (req, res) => {
  Subject.deleteOne({ _id: req.subject._id }, (err, removedSubject) => {
    if (err || removedSubject.deletedCount === 0) {
      return res.status(400).json({
        error: "Failed to delete Subject",
      });
    }
    Semester.updateOne(
      { _id: req.subject.semester },
      { $pull: { subjects: req.subject._id } },
      (err, op) => {
        if (err || op.modifiedCount === 0) {
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
