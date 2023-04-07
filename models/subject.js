const mongoose = require("mongoose");
const { removeFile } = require("../utilities/remove_file");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;
const ObjectIdForQuery = mongoose.Types.ObjectId;

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
    fcs_pic_path: {
      type:String,
      trim:true,
      default:"",
    },
    credits: {
      type: Number,
      required: true,
    },
    semester: {
      type: ObjectId,
      ref: "Semester",
      required: true,
    },
  },
  { timestamps: true }
);

subjectSchema.index({name:1,semester:1},{unique:true})

subjectSchema.pre("deleteOne", async function (next) {
  const subject = await this.model.findOne(this.getQuery());
  await preDeleteSubject(subject, next);
  return next();
});

subjectSchema.pre("deleteMany", async function (next) {
  const subjects = await this.model.find(this.getQuery());
  for (const subject of subjects) {
    await preDeleteSubject(subject, next);
  }
  return next();
});

const preDeleteSubject = async (subject, next) => {
  const Resource = require("./resource");
  const Assignment = require("./assignment");
  const Teacher = require("./teacher");
  const AttendanceSession = require("./attendance_session");
  try {
    /// REMOVING ALL RESOURCES FROM THIS SUBJECT
    await Resource.deleteMany({ subject: subject._id });
    /// REMOVING ALL ASSIGNMENT FROM THIS SUBJECT
    await Assignment.deleteMany({ subject: subject._id });
    /// REMOVING SUBJECT FROM TEACHER
    await Teacher.updateOne(
      { subjects: { $in: [ObjectIdForQuery(subject._id)] } },
      { $pull: { subjects: subject._id } }
    );
    /// REMOVING ALL ATTENDANCE SESSIONRELATED TO SUBJECT
    await AttendanceSession.deleteMany({ subject: subject._id });
  } catch (e) {
    return next(e);
  }
  // if (subject.pic_url) {
  //   removeFile(subject.pic_url);
  // }
  if (subject.fcs_pic_path) {
    removeFile(subject.fcs_pic_path);
  }
};

module.exports = mongoose.model("Subject", subjectSchema);
