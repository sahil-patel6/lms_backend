var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

var subjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    pic_url: {
      type: String,
      trim: true,
      default: "",
    },
    credits: {
      type: Number,
      required: true,
    },
    lessons: {
      type: [
        {
          type: ObjectId,
          ref: "Lesson",
        },
      ],
      default: [],
    },
    assignments: {
      type: [
        {
          type: ObjectId,
          ref: "Assignment",
        },
      ],
      default: [],
    },
    semester: {
      type: ObjectId,
      ref: "Semester",
    },
    department: {
      type: ObjectId,
      ref: "Department",
    },
    teacher: {
      type: ObjectId,
      ref: "Teacher",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
