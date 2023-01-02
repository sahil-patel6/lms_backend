var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

var attendanceSchema = new Schema(
    {
        date: {
            type: String,
            required: true,
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
