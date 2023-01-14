const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const timetableSchema = new Schema(
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
