const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const {unlink: removeFile} = require("fs");

const assignmentSchema = new Schema(
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

assignmentSchema.pre("save",async function(next){
    const Subject = require("./subject")
    try{
        await Subject.updateOne({ _id: this.subject },{ $push: { assignments: this._id } });
    } catch (e){
        return next(e);
    }
    return next();
})
assignmentSchema.pre("deleteOne",async function (next){
    const AssignmentSubmission = require("./assignment_submission")
    const Subject = require("./subject")
    const assignment = await this.model.findOne(this.getQuery());
    /// DELETE ASSIGNMENT QUESTION FILES IF EXISTS
    assignment.assignment_question_files.forEach((question)=>{
        removeFile(`${__dirname}/../public${question}`,(err)=>{
            if (err){
                console.log(err);
            }else{
                console.log("Successfully deleted:",question)
            }
        })
    })
    try{
        await Subject.updateOne({_id: assignment.subject}, {$pull: {assignments: assignment._id}})
        await AssignmentSubmission.deleteMany({assignment:assignment._id})
    }catch (e){
        return next(e);
    }
    return next()
});

assignmentSchema.pre("deleteMany", async function(next){
    const assignments = await this.model.find(this.getQuery())
    const AssignmentSubmission = require("./assignment_submission")
    const Subject = require("./subject")
    console.log(assignments)
    for (const assignment of assignments) {
        assignment.assignment_question_files.forEach((assignment_question_file)=>{
            removeFile(`${__dirname}/../public${assignment_question_file}`,(err)=>{
                if (err){
                    console.log(err);
                }else{
                    console.log("Successfully deleted:",assignment_question_file)
                }
            })
        })
        try{
            await Subject.updateOne({_id: assignment.subject}, {$pull: {assignments: assignment._id}})
            await AssignmentSubmission.deleteMany({assignment:assignment._id})
        } catch (e){
            next(e);
        }
    }
    return next();
})

module.exports = mongoose.model("Assignment", assignmentSchema);
