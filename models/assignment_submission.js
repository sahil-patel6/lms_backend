const mongoose = require("mongoose");
const { removeFile } = require("../utilities/remove_file");
const fileSchema = require("./file_schema");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const assignmentSubmissionSchema = new Schema(
  {
    submission: {
      type: [fileSchema],
      required: true,
    },
    comments: {
      type: String,
      default: "",
    },
    student: {
      type: ObjectId,
      ref: "Student",
    },
    assignment: {
      type: ObjectId,
      ref: "Assignment",
    },
    submission_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

assignmentSubmissionSchema.pre("save", async function (next) {
  try {
    const Assignment = require("./assignment");
    const assignment = await Assignment.findOne({ _id: this.assignment });
    if (!assignment.isSubmissionAllowed) {
      throw new Error("Submission is not allowed");
    }
  } catch (error) {
    next(error);
  }
});

assignmentSubmissionSchema.pre("deleteOne", async function (next) {
  const assignment_submission = await this.model
    .findOne(this.getQuery())
    .populate("assignment");
  await preDeleteAssignmentSubmission(assignment_submission, next);
  return next();
});

assignmentSubmissionSchema.pre("deleteMany", async function (next) {
  const assignment_submissions = await this.model.find(this.getQuery());
  for (const assignment_submission of assignment_submissions) {
    await preDeleteAssignmentSubmission(assignment_submission, next);
  }
  return next();
});

const preDeleteAssignmentSubmission = async (assignment_submission, next) => {
  /// DELETE ASSIGNMENT SUBMISSION FILES IF EXISTS
  assignment_submission.submission.forEach((submission_file) => {
    removeFile(submission_file.fcs_path);
  });
};

module.exports = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);
