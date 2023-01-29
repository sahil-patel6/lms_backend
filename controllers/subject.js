const Subject = require("../models/subject");
const Department = require("../models/department");
const {removeFile} = require("../utilities/remove_file");

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
      .populate("resources","-__v -createdAt -updatedAt -subject")
      .populate("assignments","-__v -createdAt -updatedAt -submissions -subject")
      .populate("semester","_id name")
      .populate("department", "_id name")
      .populate("teacher","_id name")
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
      .populate("resources","-__v -createdAt -updatedAt -subject")
      .populate("assignments","-__v -createdAt -updatedAt -submissions -subject")
      .populate("semester","_id name")
      .populate("department", "_id name")
      .populate("teacher","_id name")
      .select("-createdAt -updatedAt -__v")
      .exec((err, subjects) => {
      if (err || !subjects) {
        console.log(err);
        return res.status(400).json({
          error:
            "An error occurred while trying to find all subjects from db " +
            err,
        });
      } else {
        return res.json({subjects});
      }
    });
};

exports.checkIfDepartmentAndSemesterExists = (req,res,next) =>{
    Department.findById(req.body.department,(err,department)=>{
        if (err || !department){
            return res.status(400).json({
                error: "No department found"
            })
        }
        if (!department.semesters.find(semester=>semester==req.body.semester)){
            return res.status(400).json({
                error: "No Semester found"
            })
        }
        next();
    })
}

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
        /// REMOVING SUBJECT PIC URL IF IT EXISTS BECAUSE OF ERROR
        if (req.body.pic_url){
            removeFile(req.body.pic_url);
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
}

exports.updateSubject = (req, res) => {
    if (req?.file?.pic_url){
        /// HERE WE CHECK IF SUBJECT HAS PIC_URL AND IF IT DOES THEN WE REMOVE PIC FROM FILE SYSTEM
        if (req.subject.pic_url){
            removeFile(req.subject.pic_url);
        }
        console.log(req.file?.pic_url?.filepath, req.file?.pic_url?.newFilename);
        req.body.pic_url = `/uploads/subjects/${req.file.pic_url.newFilename}`;
    }
    Subject.findOneAndUpdate(
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
      return res.json({
          message: `${req.subject.name} Subject Deleted Successfully`,
      });
  });
};
