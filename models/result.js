const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const resultSchema = new Schema(
    {
        result_name :{
            type:String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now()
        },
        result: {
            type:String,
            required: true,
        },
        student: {
            type: ObjectId,
            ref: "Student",
            required: true,
        },
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
