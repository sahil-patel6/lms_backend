const Attendance = require("../models/attendance");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");
const Subject = require("../models/subject");
const Student = require("../models/student");

exports.attendanceQueryHandler = async (req, res, next) => {
  req.attendance_query = {
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
      req.attendance_query.subject = ObjectId(req.query.subject);
    }
    /// CHECKING IF STUDENT EXISTS
    if (req.query.student) {
      const student = await Student.findById(req.query.student);
      if (!student) {
        return res.status(400).json({
          error: "Please send a existing student id",
        });
      }
      req.attendance_query.student = ObjectId(req.query.student);
    }
  } catch (err) {
    return res.status(400).json({
      error: "An error occured. Please try again later",
    });
  }
  next();
};

exports.getAttendanceById = (req, res, next, id) => {
  Attendance.findById(id)
    .populate("subject", "_id name")
    .populate("student", "_id name")
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
  Attendance.aggregate([
    {
      $match: req.attendance_query,
    },
    {
      $group: {
        _id: {
          student: "$student",
          subject: "$subject",
        },
        totalLectures: { $sum: 1 },
        totalLecturesAttended: {
          $sum: {
            $cond: [{ $eq: ["$present", true] }, 1, 0],
          },
        },
        totalLecturesAbsent: {
          $sum: {
            $cond: [{ $eq: ["$present", false] }, 1, 0],
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id.student",
        subjects: {
          $push: {
            subject: "$_id.subject",
            totalLectures: "$totalLectures",
            totalLecturesAttended: "$totalLecturesAttended",
            totalLecturesAbsent: "$totalLecturesAbsent",
            attendance_percentage: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$totalLecturesAttended", "$totalLectures"] },
                    100,
                  ],
                },
                2,
              ],
            },
          },
        },
        totalLectures: { $sum: "$totalLectures" },
        totalLecturesAttended: { $sum: "$totalLecturesAttended" },
        totalLecturesAbsent: { $sum: "$totalLecturesAbsent" },
      },
    },
    {
      $lookup:{
        from: "students",
        localField: "_id",
        foreignField: "_id",
        as: "student",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
            }
          }
        ]
      }
    },
    /// TODO: NEED CHANGES
    {
      $lookup:{
        from: "subjects",
        localField: "subjects.subject",
        foreignField: "_id",
        let: {totalLectures: "$subjects.totalLectures"},
        as: "subjects",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              totalLectures: "$$totalLectures",
              totalLecturesAbsent:1,
              totalLecturesAttended: 1,
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: 1,
        student:1,
        totalLectures: 1,
        totalLecturesAttended: 1,
        totalLecturesAbsent: 1,
        attendance_percentage: {
          $round: [
            {
              $multiply: [
                { $divide: ["$totalLecturesAttended", "$totalLectures"] },
                100,
              ],
            },
            2,
          ],
        },
        subjects: 1,
      },
    }
  ]).exec((err, attendances) => {
    if (err || !attendances) {
      console.log("Error while getting attendace: ", err);
      return res.status(400).json({
        error: "No Attendance Found",
      });
    }
    res.json(attendances);
  });
  // Attendance.find(req.attendance_query)
  //   .populate("student", "_id name")
  //   .populate("subject", "_id name")
  //   .select("-__v -createdAt -updatedAt")
  //   .sort("date")
  //   .exec((err, attendances) => {
  //     if (err || !attendances) {
  //       console.log("Error while getting attendace: ", err);
  //       return res.status(400).json({
  //         error: "No Attendance Found",
  //       });
  //     }
  //     res.json({
  //       attendance: attendances,
  //     });
  //   });
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
    .populate("subject","_id name")
    .populate("student","_id name")
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
