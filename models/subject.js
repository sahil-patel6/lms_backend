const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const {unlink: removeFile} = require("fs");

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    pic_url: {
      type: String,
      trim: true,
      default: "",
    },
    credits: {
      type: Number,
      required: true,
    },
    lessons: {
      type: [
        {
          type: ObjectId,
          ref: "Lesson",
        },
      ],
      default: [],
    },
    assignments: {
      type: [
        {
          type: ObjectId,
          ref: "Assignment",
        },
      ],
      default: [],
    },
    semester: {
      type: ObjectId,
      ref: "Semester",
    },
    department: {
      type: ObjectId,
      ref: "Department",
    },
    teacher: {
      type: ObjectId,
      ref: "Teacher",
    },
  },
  { timestamps: true }
);

subjectSchema.pre("save",async function(next){
    const Semester = require("./semester")
    try{
        await Semester.updateOne({ _id: this.semester }, { $push: { subjects: this._id } })
    }catch (e) {
        return next(e);
    }
    return next();
})

subjectSchema.pre("deleteOne",async function(next){
    const subject = await this.model.findOne(this.getQuery());
    const Semester = require("./semester")
    const Lesson = require("./lesson")
    const Assignment = require("./assignment")
    const Teacher = require("./teacher")
    /// DELETING SUBJECT PIC URL IF IT EXISTS
    if (subject.pic_url){
        removeFile(`${__dirname}/../public${subject.pic_url}`,(err)=>{
            if (err){
                console.log(err)
            }else{
                console.log("Successfully Deleted:",subject.pic_url)
            }
        })
    }
    try{
        /// REMOVING SUBJECT FROM SEMESTER
        await Semester.updateOne({ _id: subject.semester }, { $pull: { subjects: subject._id } });
        /// REMOVING ALL LESSONS FROM THIS SUBJECT
        await Lesson.deleteMany({subject:subject._id})
        /// REMOVING ALL ASSIGNMENT FROM THIS SUBJECT
        await Assignment.deleteMany({subject:subject._id});
        /// REMOVING SUBJECT FROM TEACHER
        await Teacher.updateOne({subject:subject._id},{$pull:{subjects:subject._id}})
    }catch (e) {
        return next(e);
    }
    return next();
})

subjectSchema.pre("deleteMany", async function(next){
    const subjects = await this.model.find(this.getQuery())
    const Semester = require("./semester")
    const Lesson = require("./lesson")
    const Assignment = require("./assignment")
    const Teacher = require("./teacher")
    for (const subject of subjects) {
        removeFile(`${__dirname}/../public${subject.pic_url}`,(err)=>{
            if (err){
                console.log(err);
            }else{
                console.log("Successfully deleted:",subject.pic_url)
            }
        })
        try{
            await Semester.updateOne({ _id: subject.semester },{ $pull: { subjects: subject._id } });

            /// REMOVING ALL LESSONS FROM THIS SUBJECT
            await Lesson.deleteMany({subject:subject._id})
            /// REMOVING ALL ASSIGNMENT FROM THIS SUBJECT
            await Assignment.deleteMany({subject:subject._id});
            /// REMOVING SUBJECT FROM TEACHER
            await Teacher.updateOne({subject:subject._id},{$pull:{subjects:subject._id}})
        } catch (e){
            return next(e);
        }
    }
    return next();
})

module.exports = mongoose.model("Subject", subjectSchema);
