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
    const Assignment = require("./assignment")
    try{
        await Assignment.updateOne(
            { _id: this.assignment },
            { $push: { submissions: this._id } });
    } catch (e){
        return next(e);
    }
    return next();
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
    const Assignment = require("./assignment")
    /// REMOVING ASSIGNMENT SUBMISSION FROM ASSIGNMENT
    try{
        await Assignment.updateOne(
            { _id: assignment_submission.assignment },
            { $pull: { submissions: assignment_submission._id } })
    }catch (e){
        return next(e);
    }
    /// DELETE ASSIGNMENT SUBMISSION FILES IF EXISTS
    assignment_submission.submission.forEach((submission_file)=>{
        removeFile(submission_file);
    })
}

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
