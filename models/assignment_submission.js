var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const {ObjectId} = mongoose.Schema;

const assignmentSubmissionSchema = new Schema({
        submission: {
            type: [String],
            required: true
        },
        comments: {
            type: String,
            default: "",
        },
        student: {
            type: ObjectId,
            ref: "Student"
        },
        assignment: {
            type: ObjectId,
            ref: "Assignment"
        },
    },
    {timestamps: true},
);

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
