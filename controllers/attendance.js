const Attendance = require("../models/attendance");
const mongoose = require("mongoose");
const moment = require("moment");
const Subject = require("../models/subject");
const Student = require("../models/student");

exports.attendanceQueryHandler = (req, res, next) => {
  req.attendance_query = {
    date: {
      $gte: moment(req.query.start_date).startOf("day").toDate(),
      $lte: moment(req.query.end_date).endOf("day").toDate(),
    },
  };
  if (req.query.subject) {
    Subject.findById(req.query.subject).exec((err, subject) => {
      if (err || !subject) {
        return res.status(400).json({
          error: "Please send a existing subject Id",
        });
      }
      req.attendance_query.subject = new mongoose.mongo.ObjectId(
        req.query.subject
      );
    });
  }
  if (req.query.student) {
    Student.findById(req.query.student).exec((err, student) => {
      if (err || !student) {
        return res.status(400).json({
          error: "Please send a existing student id",
        });
      }
      req.attendance_query.student = new mongoose.mongo.ObjectId(
        req.query.student
      );
    });
  }
  next();
};

exports.getAttendanceById = (req, res, next, id) => {
    Attendance.findById(id)
        .populate("subject","_id name")
        .populate("student","_id name")
        .select("-__v -createdAt -updatedAt")
        .exec((err, attendance) => {
        if (err || !attendance) {
            console.log(err);
            return res.status(400).json({
                error: "No attendance Found",
            });
        }
        req.attendance = {
            ...attendance._doc,
        };
        next();
    });
};

exports.getAttendance = (req, res, next) => {
  console.log(req.query);
  Attendance.find(req.attendance_query)
    .populate("student", "_id name")
    .populate("subject", "_id name")
    .select("-__v -createdAt -updatedAt")
    .sort("date")
    .exec((err, attendances) => {
      if (err || !attendances) {
        console.log("Error while creating attendace: ", err);
        return res.status(400).json({
          error: "No Attendance Found",
        });
      }
      res.json({
        attendance: attendances,
      });
    });
};

exports.createAttendance = (req, res, next) => {
  Attendance.insertMany(req.body.attendance, (err, attendances) => {
    if (err || !attendances) {
      console.log(err);
      return res.status(400).json({
        error: "Not able to save attendances in DB",
      });
    } else {
      attendances.__v = undefined;
      attendances.createdAt = undefined;
      attendances.updatedAt = undefined;
      return res.json(attendances);
    }
  });
};

exports.updateAttendance = (req, res) => {
  Attendance.findOneAndUpdate(
    { _id: req.attendance._id },
    { $set: req.body },
    { new: true }
  )
    .select("-createdAt -updatedAt -__v")
    .exec((err, attendance) => {
      if (err || !attendance) {
        return res.status(400).json({
          error: "Update failed",
        });
      }
      return res.json(attendance);
    });
};

exports.deleteAttendance = (req, res) => {
  req.attendance_query = {
    date: {
      $gte: moment(req.query.start_date).startOf("day").toDate(),
      $lte: moment(req.query.end_date).endOf("day").toDate(),
    },
  };
  Attendance.deleteMany(req.attendance_query, (err, removedAttendance) => {
    if (err || removedAttendance.deletedCount === 0) {
      console.log(err);
      return res.status(400).json({
        error: "Failed to delete Attendance",
      });
    }
    return res.json({
      message: "Attendance Deleted Successfully",
    });
  });
};
