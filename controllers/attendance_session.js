const AttendanceSession = require("../models/attendance_session");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");
const Subject = require("../models/subject");
const Student = require("../models/student");
const agenda = require("../agenda");

exports.attendanceSessionQueryHandler = async (req, res, next) => {
  req.attendance_session_query = {
    date: {
      $gte: moment(req.query.start_date).startOf("day").toDate(),
      $lte: moment(req.query.end_date).endOf("day").toDate(),
    },
  };
  try {
    /// CHECKING IF SUBJECT EXISTS
    if (req.query.subject) {
      const subject = await Subject.findById(req.query.subject);
      if (!subject) {
        return res.status(400).json({
          error: "Please send a existing subject Id",
        });
      }
      req.attendance_session_query.subject = ObjectId(req.query.subject);
    }
    /// CHECKING IF STUDENT EXISTS
    if (req.query.student) {
      const student = await Student.findById(req.query.student);
      if (!student) {
        return res.status(400).json({
          error: "Please send a existing student id",
        });
      }
      req.attendance_session_query.attendances.student = ObjectId(
        req.query.student
      );
    }
  } catch (err) {
    return res.status(400).json({
      error: "An error occured. Please try again later",
    });
  }
  next();
};

exports.getAttendanceSessionById = (req, res, next, id) => {
  AttendanceSession.findById(id)
    .populate({
      path: "subject",
      select: "-__v -createdAt -updatedAt",
      populate: {
        path: "semester",
        select: "-__v -createdAt -updatedAt",
        populate: {
          path: "department",
          select: "-__v -createdAt -updatedAt",
        },
      },
    })
    .populate(
      "attendances.student",
      "-createdAt -updatedAt -fcm_token -salt -password -__v"
    )
    .populate({
      path: "semester",
      select: "-__v -createdAt -updatedAt",
      populate: {
        path: "department",
        select: "-__v -createdAt -updatedAt",
      },
    })
    .select("-__v -createdAt -updatedAt")
    .exec((err, attendanceSession) => {
      if (err || !attendanceSession) {
        console.log(err);
        return res.status(400).json({
          error: "No attendance session Found",
        });
      }
      req.attendanceSession = {
        ...attendanceSession._doc,
      };
      next();
    });
};

exports.getAttendanceSession = (req, res) => {
  AttendanceSession.find(req.attendance_session_query)
    .populate({
      path: "subject",
      select: "-__v -createdAt -updatedAt",
      populate: {
        path: "semester",
        select: "-__v -createdAt -updatedAt",
        populate: {
          path: "department",
          select: "-__v -createdAt -updatedAt",
        },
      },
    })
    .populate(
      "attendances.student",
      "-createdAt -updatedAt -fcm_token -salt -password -__v"
    )
    .populate({
      path: "semester",
      select: "-__v -createdAt -updatedAt",
      populate: {
        path: "department",
        select: "-__v -createdAt -updatedAt",
      },
    })
    .select("-__v -createdAt -updatedAt")
    .sort("date")
    .exec((err, attendances) => {
      if (err || !attendances) {
        console.log("Error while getting attendace: ", err);
        return res.status(400).json({
          error: "No Attendance Found",
        });
      }
      res.json(attendances);
    });
};

exports.createAttendanceSession = (req, res) => {
  const attendance_session = new AttendanceSession(req.body);
  attendance_session.save((err, attendance_session) => {
    if (err || !attendance_session) {
      console.log(err);
      return res.status(400).json({
        error: "Not able to save attendance session in DB",
      });
    } else {
      attendance_session.__v = undefined;
      attendance_session.createdAt = undefined;
      attendance_session.updatedAt = undefined;
      agenda.now("send attendance absent mail", attendance_session);
      agenda.now("send attendance absent notification", attendance_session);
      return res.json(attendance_session);
    }
  });
};

exports.updateAttendanceSession = (req, res) => {
  AttendanceSession.findOneAndUpdate(
    { _id: req.attendanceSession._id },
    { $set: req.body },
    { new: true }
  )
    .populate("subject", "_id name")
    .populate("attendances.student", "_id name")
    .select("-__v -createdAt -updatedAt")
    .exec((err, attendance) => {
      if (err || !attendance) {
        return res.status(400).json({
          error: "Update failed",
        });
      }
      return res.json(attendance);
    });
};

exports.deleteAttendanceSession = (req, res) => {
  AttendanceSession.deleteOne(
    req.attendanceSession._id,
    (err, removedAttendanceSession) => {
      if (err || removedAttendanceSession.deletedCount === 0) {
        console.log(err);
        return res.status(400).json({
          error: "Failed to delete Attendance Session",
        });
      }
      return res.json({
        message: "Attendance Session Deleted Successfully",
      });
    }
  );
};
