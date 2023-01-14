const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const {unlink:removeFile} = require("fs")

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
    const Subject = require("./subject")
    const lesson = await this.model.findOne(this.getQuery());
    lesson.files.forEach((file)=>{
        removeFile(`${__dirname}/../public${file}`,(err)=>{
            if (err){
                console.log(err)
            }else{
                console.log("Successfully Deleted:",file)
            }
        })
    })
    try{
        await Subject.updateOne({ _id: lesson.subject }, { $pull: { lessons: lesson._id } });
    } catch (e) {
        return next(e)
    }
    return next()
})

lessonSchema.pre("deleteMany", async function(next){
    const Subject = require("./subject")
    const lessons = await this.model.find(this.getQuery());
    for (const lesson of lessons) {
        lesson.files.forEach((file)=>{
            removeFile(`${__dirname}/../public${file}`,(err)=>{
                if (err){
                    console.log(err)
                }else{
                    console.log("Successfully Deleted:",file)
                }
            })
        })
        try{
            await Subject.updateOne({ _id: lesson.subject }, { $pull: { lessons: lesson._id } });
        } catch (e) {
            next(e);
        }
        next();
    }
})

module.exports = mongoose.model("Lesson", lessonSchema);
