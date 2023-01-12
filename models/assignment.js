var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

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
            default: ""
        },
        marks: {
            type:Number,
            default: 10
        },
        subject: {
            type: ObjectId,
            ref: "Subject",
            required: true,
        },
        dueDate: {
            type: Date,
            required: true
        },
        assignment_question_files: {
            type: [{
                type: String,
            }],
            default: []
        },
        submissions: {
            type: [{
                type: ObjectId,
                ref: "AssignmentSubmission"
            }],
            default: []
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
