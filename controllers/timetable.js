const Timetable = require("../models/timetable");
const Department = require("../models/department");
const {removeFile} = require("../utilities/remove_file");

exports.setTimetableUploadDir = (req, res, next)=>{
    const fs = require('fs');
    const dir = `${__dirname}/../public/uploads/timetables/`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
    req.uploadDir = dir;
    next();
}

exports.getTimetableById = (req, res, next, id) => {
  Timetable.findById(id)
      .populate("semester","_id name")
      .populate("department", "_id name")
    .exec((err, timetable) => {
      if (err || !timetable) {
        return res.status(400).json({
          error: "No Timetable Found",
        });
      }
      req.timetable = timetable._doc;
      next();
    });
};

exports.getTimetable = (req, res) => {
  req.timetable.__v = undefined;
  req.timetable.createdAt = undefined;
  req.timetable.updatedAt = undefined;
  return res.json(req.timetable);
};

exports.getTimetableBySemester = (req, res) => {
  Timetable.findOne({ semester: req.params.semesterId })
      .populate("semester","_id name")
      .populate("department", "_id name")
      .select("-createdAt -updatedAt -__v")
      .exec((err, timetable) => {
      if (err || !timetable) {
        console.log(err);
        return res.status(400).json({
          error:
            "An error occurred while trying to find all timetable from db " +
            err,
        });
      } else {
        return res.json({timetable});
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

exports.createTimetable = (req, res,next) => {
    if (req?.file?.timetable){
      console.log(req.file.timetable.filepath, req.file.timetable.newFilename);
      req.body.timetable = `/uploads/timetables/${req.file.timetable.newFilename}`;
    }else{
      req.body.timetable = "";
    }
    Timetable.findOne({semester:req.semester},(err,timetable)=>{
        if (err){
            removeFile(req.body.timetable);
            res.status(400).json({
                error: "Something Went Wrong while creating timetable"
            })
        }else if (timetable){
            removeFile(req.body.timetable);
            res.status(400).json({
                error: "Timetable already exists so please try to update existing one"
            })
        }else {
            const timetable = new Timetable(req.body);
            timetable.save((err, timetable) => {
            if (err || !timetable) {
                console.log(err);
                /// REMOVING timetable PIC URL IF IT EXISTS BECAUSE OF ERROR
                if (req.body.timetable){
                    removeFile(req.body.timetable);
                }
                return res.status(400).json({
                error: "Not able to save timetable in DB",
                });
            } else {
                timetable.__v = undefined;
                timetable.createdAt = undefined;
                timetable.updatedAt = undefined;
                return res.json(timetable);
            }
            });
        }
    });
}

exports.updateTimetable = (req, res) => {
    if (req?.file?.timetable){
        /// HERE WE CHECK IF TIMETABLE HAS TIMETABLE AND IF IT DOES THEN WE REMOVE PIC FROM FILE SYSTEM
        if (req.timetable.timetable){
            removeFile(req.timetable.timetable);
        }
        console.log(req.file?.timetable?.filepath, req.file?.timetable?.newFilename);
        req.body.timetable = `/uploads/timetables/${req.file.timetable.newFilename}`;
    }
    Timetable.findOneAndUpdate(
      { _id: req.timetable._id },
      { $set: req.body},
      { new: true })
        .select("-createdAt -updatedAt -__v")
        .exec((err, timetable) => {
        if (err || !timetable) {
          return res.status(400).json({
            error: "Update failed",
          });
        }
        return res.json(timetable);
      }
    );
};

exports.deleteTimetable = (req, res) => {
  Timetable.deleteOne({ _id: req.timetable._id }, (err, removedTimetable) => {
    if (err || removedTimetable.deletedCount === 0) {
      return res.status(400).json({
        error: "Failed to delete timetable",
      });
    }
      return res.json({
          message: "Timetable Deleted Successfully",
      });
  });
};
