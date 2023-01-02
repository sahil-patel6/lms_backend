var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

var departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
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
    semesters: {
      type: [
        {
          type: ObjectId,
          ref: "Semester",
          required: true,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
