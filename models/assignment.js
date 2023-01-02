var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const assignmentSubmissionSchema = mongoose.Schema({
    submission: [String],
    student: {
        type: ObjectId,
        ref: "Student"
    },
    assignment: {
        type: ObjectId,
        ref: "Assignment"
    },
  });

var assignmentSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            maxlength: 32,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "This information has not been added yet"
        },
        marks: {
            type:Number,
            default: 10
        },
        semester: {
            type: ObjectId,
            ref: "Semester",
            required: true,
        },
        subject: {
            type: ObjectId,
            ref: "Subject",
            required: true,
        },
        department: {
            type: ObjectId,
            ref: "Department",
            required: true,
        },
        submissions: [assignmentSubmissionSchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
