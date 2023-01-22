const mongoose = require("mongoose");
const {removeFile} = require("../utilities/remove_file");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

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
      required: true
    },
    department: {
      type: ObjectId,
      ref: "Department",
      required: true
    },
    teacher: {
      type: ObjectId,
      ref: "Teacher",
      default: null
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
    await preDeleteSubject(subject,next);
    return next();
})

subjectSchema.pre("deleteMany", async function(next){
    const subjects = await this.model.find(this.getQuery())
    for (const subject of subjects) {
        await preDeleteSubject(subject,next);
    }
    return next();
})

const preDeleteSubject = async (subject,next)=>{
    const Semester = require("./semester")
    const Lesson = require("./lesson")
    const Assignment = require("./assignment")
    const Teacher = require("./teacher")
    try{
        /// UPDATING SEMESTER BY REMOVING THE SUBJECT FROM ITS SUBJECTS LIST
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
    if (subject.pic_url){
        removeFile(subject.pic_url)
    }
}

module.exports = mongoose.model("Subject", subjectSchema);
