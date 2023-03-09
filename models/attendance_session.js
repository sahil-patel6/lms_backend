const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const attendaceSchema = new Schema({
  student: {
    type: ObjectId,
    ref: "Student",
    required: true,
  },
  present: {
    type: Boolean,
    required: true,
  },
});

const attendanceSessionSchema = new Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    subject: {
      type: ObjectId,
      ref: "Subject",
      required: true,
    },
    semester:{
      type: ObjectId,
      ref: "Semester",
      required: true,
    },
    start_time: {
      type: Date,
      reqiured: true,
    },
    end_time: {
      type: Date,
      reqiured: true,
    },
    attendances: {
      type: [attendaceSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);
