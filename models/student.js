const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { removeFile } = require("../utilities/remove_file");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;
const ObjectIdForQuery = mongoose.Types.ObjectId;

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    roll_number: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    profile_pic: {
      type: String,
      trim: true,
      default: "",
    },
    fcs_profile_pic_path: {
      type: String,
      trim: true,
      default: "",
    },
    fcm_token: {
      type: String,
      trim: true,
      default: "",
    },
    semester: {
      type: ObjectId,
      ref: "Semester",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: String,
  },
  { timestamps: true }
);

studentSchema
  .virtual("plainPassword")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv4();
    this.password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

studentSchema.methods = {
  securePassword: function (plainPassword) {
    if (!plainPassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainPassword)
        .digest("hex");
    } catch (error) {
      return "";
    }
  },
  authenticate: function (plainPassword) {
    return this.securePassword(plainPassword) === this.password;
  },
  updatePassword: function (plainPassword, cb) {
    this.updateOne({ password: this.securePassword(plainPassword) }, cb);
  },
};

studentSchema.pre("deleteOne", async function (next) {
  const student = await this.model.findOne(this.getQuery());
  await preDeleteStudent(student, next);
  return next();
});
studentSchema.pre("deleteMany", async function (next) {
  const students = await this.model.find(this.getQuery());
  for (const student of students) {
    await preDeleteStudent(student, next);
  }
  return next();
});

const preDeleteStudent = async (student, next) => {
  const Parent = require("./parent");
  const AttendanceSession = require("./attendance_session");
  const AssignmentSubmission = require("./assignment_submission");
  try {
    /// REMOVING STUDENT FROM PARENT'S STUDENT LIST
    await Parent.updateOne(
      { students: { $in: [ObjectIdForQuery(student._id)] } },
      { $pull: { students: student._id } }
    );
    /// REMOVING ASSIGNMENT SUBMISSION
    await AssignmentSubmission.deleteMany({ student: student._id });
    /// REMOVING STUDENT'S ATTENDANCE
    /// TODO: NEED TO PROPERLY REMOVE STUDENT'S ATTENDACE
    await AttendanceSession.updateMany(
      {
        "attendances.student": student._id,
      },
      {
        $pull: {
          attendances: {
            student: student._id,
          },
        },
      }
    );
  } catch (e) {
    return next(e);
  }
  // if (student.profile_pic){
  //     removeFile(student.profile_pic)
  // }
  if (student.fcs_profile_pic_path) {
    removeFile(student.fcs_profile_pic_path);
  }
};
module.exports = mongoose.model("Student", studentSchema);
