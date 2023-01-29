const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const semesterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    department: {
      type: ObjectId,
      ref: "Department",
      required: true,
    },
    subjects: {
      type: [
        {
          type: ObjectId,
          ref: "Subject",
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

semesterSchema.pre("save", async function(next){
   const Department = require("./department")
   try{
       await Department.updateOne({ _id: this.department },{ $push: { semesters: this._id } })
   } catch (e) {
       return next(e);
   }
   return next();
});

semesterSchema.pre("deleteOne",async function(next){
    const semester = await this.model.findOne(this.getQuery());
    await preDeleteSemester(semester,next);
    return next()
})
semesterSchema.pre("deleteMany", async function(next){
    const semesters = await this.model.find(this.getQuery());
    for (const semester of semesters) {
        await preDeleteSemester(semester,next);
    }
    return next();
})

const preDeleteSemester = async (semester,next)=>{
    const Department = require("./department")
    const Subject = require("./subject")
    const Timetable = require("./timetable")
    const Result = require("./result")
    try {
        await Subject.deleteMany({semester:semester._id});
        await Department.updateOne({_id:semester.department},{$pull: {semesters:semester._id}})
        await Timetable.deleteOne({semester:semester._id});
        await Result.deleteOne({semester: semester._id});
    } catch (e) {
        return next(e);
    }
}

module.exports = mongoose.model("Semester", semesterSchema);
