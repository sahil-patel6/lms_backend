const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const semesterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
    },
    department: {
      type: ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { timestamps: true }
);

semesterSchema.index({name:1,department:1},{unique:true})

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
    const Subject = require("./subject")
    const Notice = require("./notice");
    const Student = require("./student")
    try {
        await Subject.deleteMany({semester:semester._id});
        await Notice.deleteOne({semester:semester._id})
        await Student.deleteMany({semester:semester._id});
    } catch (e) {
        return next(e);
    }
}

module.exports = mongoose.model("Semester", semesterSchema);
