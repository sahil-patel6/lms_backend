const mongoose = require("mongoose");
const {removeFile} = require("../utilities/remove_file");
const Schema = mongoose.Schema;
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

assignmentSubmissionSchema.pre("save",async function(next){
    try {
        const Assignment = require("./assignment");
        const assignment = await Assignment.findOne({_id: this.assignment});
        console.log(assignment);
        if (!assignment.isSubmissionAllowed){
            throw new Error("Submission is not allowed")
        }
    } catch (error) {
        next(error);
    }
})

assignmentSubmissionSchema.pre("deleteOne",async function (next){
    const assignment_submission = await this.model.findOne(this.getQuery()).populate("assignment");
    await preDeleteAssignmentSubmission(assignment_submission,next);
    return next()
});

assignmentSubmissionSchema.pre("deleteMany",async function(next){
    const assignment_submissions = await this.model.find(this.getQuery())
    for (const assignment_submission of assignment_submissions) {
        await preDeleteAssignmentSubmission(assignment_submission,next);
    }
    return next();
})

const preDeleteAssignmentSubmission = async (assignment_submission,next) =>{
    /// DELETE ASSIGNMENT SUBMISSION FILES IF EXISTS
    assignment_submission.submission.forEach((submission_file)=>{
        removeFile(submission_file);
    })
}

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);