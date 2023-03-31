const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    total_years: {
      type: Number,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

departmentSchema.pre("deleteOne",async function(next){
    const Semester = require("./semester")

    const department = await this.model.findOne(this.getQuery());

    try{
        await Semester.deleteMany({department:department._id});
    } catch (e) {
        return next(e)
    }
    return next();
})

module.exports = mongoose.model("Department", departmentSchema);
