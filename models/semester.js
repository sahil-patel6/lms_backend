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
    const Department = require("./department")
    const Subject = require("./subject")
    const semester = await this.model.findOne(this.getQuery());
    try {
        await Subject.deleteMany({semester:semester._id});
        await Department.updateOne({_id:semester.department},{$pull: {semesters:semester._id}})

    } catch (e) {
        return next(e);
    }
    return next()
})
semesterSchema.pre("deleteMany", async function(next){
    const Department = require("./department")
    const Subject = require("./subject")
    const semesters = await this.model.find(this.getQuery());
    for (const semester of semesters) {
        try{
            await Subject.deleteMany({semester:semester._id});
            await Department.updateOne({_id:semester.department},{$pull: {semesters:semester._id}})
        } catch (e){
            return next(e)
        }
    }
    return next();
})

module.exports = mongoose.model("Semester", semesterSchema);
