var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

var timetableSchema = new Schema(
    {
        department: {
            type: ObjectId,
            ref: "Department",
            required: true,
        },
        semester: {
            type: ObjectId,
            ref: "Semester",
            required: true,
        },
        timetable: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("TimeTable", timetableSchema);
