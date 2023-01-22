const mongoose = require("mongoose");
const {removeFile} = require("../utilities/remove_file");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const lessonSchema = new Schema(
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
        subject: {
            type: ObjectId,
            ref: "Subject",
            required: true,
        },
        files: {
            type: [{
                type: String,
            }],
            default: [],
        }
    },
    { timestamps: true }
);

lessonSchema.pre("save",async function(next){
    const Subject = require("./subject");
    try{
        await Subject.updateOne({ _id: this.subject }, { $push: { lessons: this._id } })
    } catch (e){
        return next(e);
    }
    return next();
})

lessonSchema.pre("deleteOne",async function(next){
    const lesson = await this.model.findOne(this.getQuery());
    await preDeleteLesson(lesson,next);
    return next()
})

lessonSchema.pre("deleteMany", async function(next){
    const lessons = await this.model.find(this.getQuery());
    for (const lesson of lessons) {
        await preDeleteLesson(lesson,next);
    }
    return next();
})

const preDeleteLesson = async (lesson,next)=>{
    const Subject = require("./subject")
    try{
        await Subject.updateOne({ _id: lesson.subject }, { $pull: { lessons: lesson._id } });
    } catch (e) {
        return next(e)
    }
    lesson.files.forEach((file)=>{
        removeFile(file);
    })
}

module.exports = mongoose.model("Lesson", lessonSchema);
