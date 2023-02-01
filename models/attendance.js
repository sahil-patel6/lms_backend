const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const attendanceSchema = new Schema(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now(),
        },
        student: {
            type: ObjectId,
            ref: "Student",
            required: true,
        },
        subject: {
            type: ObjectId,
            ref: "Subject",
            required: true,
        },
        semester: {
            type: ObjectId,
            ref: "Semester",
            required: true,
        },
        present: {
            type: Boolean,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
