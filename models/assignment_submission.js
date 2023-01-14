const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {ObjectId} = mongoose.Schema;

const {unlink: removeFile} = require("fs");

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
    const Assignment = require("./assignment")
    const assignment_submission = await this.model.findOne(this.getQuery()).populate("assignment");
    /// DELETE ASSIGNMENT SUBMISSION FILES IF EXISTS
    assignment_submission.submission.forEach((submission)=>{
        removeFile(`${__dirname}/../public${submission}`,(err)=>{
            if (err){
                console.log(err);
            }else{
                console.log("Successfully deleted:",submission)
            }
        })
    })
    /// REMOVING ASSIGNMENT SUBMISSION FROM ASSIGNMENT
    try{
        await Assignment.updateOne(
            { _id: assignment_submission.assignment },
            { $pull: { submissions: assignment_submission._id } })
    }catch (e){
        return next(e);
    }
    return next()
});

assignmentSubmissionSchema.pre("deleteMany",async function(next){
    const Assignment = require("./assignment")
    const assignment_submissions = await this.model.find(this.getQuery())
    for (const assignment_submission of assignment_submissions) {
        assignment_submission.submission.forEach((submission)=>{
            removeFile(`${__dirname}/../public${submission}`,(err)=>{
                if (err){
                    console.log(err);
                }else{
                    console.log("Successfully deleted:",submission)
                }
            })
        })
        try{
            await Assignment.updateOne(
                { _id: assignment_submission.assignment },
                { $pull: { submissions: assignment_submission._id } })
        }catch (e){
            console.log(e)
            next(e);
        }
    }
    return next();
})

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
