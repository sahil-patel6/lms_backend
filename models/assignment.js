const mongoose = require("mongoose");
const {removeFile} = require("../utilities/remove_file");
const fileSchema = require("./file_schema");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

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
        isSubmissionAllowed: {
            type: Boolean,
            default: true
        },
        assignment_question_files: {
            type: [{
                type: fileSchema,
            }],
            default: []
        },
    },
    { timestamps: true }
);

assignmentSchema.pre("deleteOne",async function (next){
    const assignment = await this.model.findOne(this.getQuery());
    await preDeleteAssignment(assignment,next);
    return next();
});

assignmentSchema.pre("deleteMany", async function(next){
    const assignments = await this.model.find(this.getQuery())
    for (const assignment of assignments) {
        await preDeleteAssignment(assignment,next);
    }
    return next();
})

const preDeleteAssignment = async (assignment, next) =>{
    const AssignmentSubmission = require("./assignment_submission")
    try{
        await AssignmentSubmission.deleteMany({assignment:assignment._id})
    }catch (e){
        return next(e);
    }
    /// DELETE ASSIGNMENT QUESTION FILES IF EXISTS
    assignment.assignment_question_files.forEach((question_file)=>{
        removeFile(question_file.fcs_path);
    })
}

module.exports = mongoose.model("Assignment", assignmentSchema);
