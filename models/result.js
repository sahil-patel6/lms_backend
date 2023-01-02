var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

var resultSchema = new Schema(
    {
        result_name :{
            type:String,
            required: true,
        },
        date: {
            type: String,
            required: true,
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
