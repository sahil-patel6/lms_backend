const Semester = require("../models/semester");
const mongoose = require("mongoose");
const {
  semesterAggregationHelper,
} = require("../utilities/aggregation_helpers");
const ObjectId = mongoose.Types.ObjectId;

exports.getSemesterById = (req, res, next, id) => {
  Semester.aggregate([
    {
      $match: {
        _id: ObjectId(id),
      },
    },
    ...semesterAggregationHelper,
  ]).exec((err, semester) => {
    if (err || !semester || semester.length === 0) {
      console.log(err);
      return res.status(400).json({
        error: "No semester Found",
      });
    }
    req.semester = semester[0];
    next();
  });
};

exports.getSemester = (req, res) => {
  return res.json(req.semester);
};

exports.getAllSemestersByDepartment = (req, res) => {
  Semester.aggregate([
    {
      $match: {
        department: ObjectId(req.params.departmentId),
      },
    },
    ...semesterAggregationHelper,
  ]).sort("name").exec((err, semesters) => {
    if (err || !semesters) {
      console.log(err);
      return res.status(400).json({
        error:
          "An error occurred while trying to find all semesters from db " + err,
      });
    } else {
      return res.json(semesters);
    }
  });
};

exports.createSemester = (req, res) => {
  const semester = new Semester(req.body);
  semester.save((err, semester) => {
    if (err || !semester) {
      console.log(err);
      return res.status(400).json({
        error: "Not able to save semester in DB",
      });
    } else {
      semester.createdAt = undefined;
      semester.updatedAt = undefined;
      semester.__v = undefined;
      return res.json(semester);
    }
  });
};

exports.updateSemester = (req, res) => {
  Semester.findOneAndUpdate(
    { _id: req.semester._id },
    { $set: req.body },
    { new: true }
  )
    .select("-createdAt -updatedAt -__v")
    .exec((err, semester) => {
      if (err || !semester) {
        return res.status(400).json({
          error: "Update failed",
        });
      }
      return res.json(semester);
    });
};

exports.deleteSemester = (req, res) => {
  Semester.deleteOne({ _id: req.semester._id }, (err, removedSemester) => {
    if (err || removedSemester.deletedCount === 0) {
      console.log(err);
      return res.status(400).json({
        error: "Failed to delete Semester",
      });
    }
    return res.json({
      message: `${req.semester.name} Semester Deleted Successfully`,
    });
  });
};
