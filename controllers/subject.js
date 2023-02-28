const Subject = require("../models/subject");
const Teacher = require("../models/teacher")
const { removeFile } = require("../utilities/remove_file");
const mongoose = require("mongoose");
const { subjectAggregationHelper } = require("../utilities/aggregation_helpers");
const ObjectId = mongoose.Types.ObjectId;

exports.setSubjectUploadDir = (req, res, next) => {
  const fs = require("fs");
  const dir = `${__dirname}/../public/uploads/subjects/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  req.uploadDir = dir;
  next();
};

exports.getSubjectById = (req, res, next, id) => {
  Subject.aggregate([
    {
      $match: {
        _id: ObjectId(id),
      },
    },
    ...subjectAggregationHelper,
  ]).exec((err, subject) => {
    if (err || !subject || subject.length === 0) {
      return res.status(400).json({
        error: "No subject Found",
      });
    }
    req.subject = subject[0];
    next();
  });
};

exports.getSubject = (req, res) => {
  req.subject.__v = undefined;
  req.subject.createdAt = undefined;
  req.subject.updatedAt = undefined;
  return res.json(req.subject);
};

exports.getSubjectsByTeacher = (req,res) => {
  Teacher.findOne({_id:req.teacher._id}).populate({
    path: "subjects",
    select: "-__v -createdAt -updatedAt",
    populate: {
      path: "semester",
      select: "-__v -createdAt -updatedAt",
      populate: {
        path: "department",
        select: "-__v -createdAt -updatedAt",
      }
    }
  }).exec((err,teacher)=>{
    if (err || !teacher){
      console.log(err);
      res.status(400).json({
        error: "Something went wrong"
      })
    }
    res.json(teacher.subjects)
  })
}

exports.getAllSubjectsBySemester = (req, res) => {
  Subject.aggregate([
    {
      $match: {
        semester: ObjectId(req.params.semesterId),
      },
    },
    ...subjectAggregationHelper,
  ]).exec((err, subjects) => {
    if (err || !subjects) {
      console.log(err);
      return res.status(400).json({
        error:
          "An error occurred while trying to find all subjects from db " + err,
      });
    } else {
      return res.json(subjects);
    }
  });
};

exports.createSubject = (req, res, next) => {
  // if (req?.file?.pic_url) {
  //   console.log(req.file.pic_url.filepath, req.file.pic_url.newFilename);
  //   req.body.pic_url = `/uploads/subjects/${req.file.pic_url.newFilename}`;
  // } else {
  //   req.body.pic_url = "";
  // }
  const subject = new Subject(req.body);
  subject.save((err, subject) => {
    if (err || !subject) {
      console.log(err);
      /// REMOVING SUBJECT PIC URL IF IT EXISTS BECAUSE OF ERROR
      // if (req.body.pic_url) {
      //   removeFile(req.body.pic_url);
      // }
      if (req.body.fcs_pic_path) {
        removeFile(req.body.fcs_pic_path);
      }
      return res.status(400).json({
        error: "Not able to save subject in DB",
      });
    } else {
      subject.__v = undefined;
      subject.createdAt = undefined;
      subject.updatedAt = undefined;
      return res.json(subject);
    }
  });
};

exports.updateSubject = (req, res) => {
  // if (req?.file?.pic_url) {
  //   /// HERE WE CHECK IF SUBJECT HAS PIC_URL AND IF IT DOES THEN WE REMOVE PIC FROM FILE SYSTEM
  //   if (req.subject.pic_url) {
  //     removeFile(req.subject.pic_url);
  //   }
  //   console.log(req.file?.pic_url?.filepath, req.file?.pic_url?.newFilename);
  //   req.body.pic_url = `/uploads/subjects/${req.file.pic_url.newFilename}`;
  // }
  Subject.findOneAndUpdate(
    { _id: req.subject._id },
    { $set: req.body },
    { new: true }
  )
    .select("-createdAt -updatedAt -__v")
    .exec((err, subject) => {
      if (err || !subject) {
        return res.status(400).json({
          error: "Update failed",
        });
      }
      return res.json(subject);
    });
};

exports.deleteSubject = (req, res) => {
  Subject.deleteOne({ _id: req.subject._id }, (err, removedSubject) => {
    if (err || removedSubject.deletedCount === 0) {
      return res.status(400).json({
        error: "Failed to delete Subject",
      });
    }
    return res.json({
      message: `${req.subject.name} Subject Deleted Successfully`,
    });
  });
};
