const AssignmentSubmission = require("../models/assignment_submission");
const fs = require("fs");
const { removeFile } = require("../utilities/remove_file");

exports.setAssignmentSubmissionUploadDir = (req, res, next) => {
  const dir = `${__dirname}/../public/uploads/assignment_submissions/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  req.uploadDir = dir;
  next();
};

exports.getAssignmentSubmissionById = (req, res, next, id) => {
  AssignmentSubmission.findById(id)
    .populate({
      path: "student",
      select: "-fcmToken -createdAt -updatedAt -__v -semester -password -salt",
    })
    .exec((err, assignment_submission) => {
      if (err || !assignment_submission) {
        console.log(err);
        return res.status(400).json({
          error: "No AssignmentSubmission Found",
        });
      }
      req.assignment_submission = assignment_submission._doc;
      next();
    });
};

exports.getAssignmentSubmission = (req, res) => {
  req.assignment_submission.__v = undefined;
  req.assignment_submission.createdAt = undefined;
  req.assignment_submission.updatedAt = undefined;
  return res.json(req.assignment_submission);
};

exports.getAllAssignmentSubmissionsByAssignment = (req, res) => {
  let params = { assignment: req.params.assignmentId };
  if (req.isStudent) {
    params.student = req.student._id;
  }
  AssignmentSubmission.find(params)
    .populate({
      path: "student",
      select: "-fcmToken -createdAt -updatedAt -__v -semester -password -salt",
    })
    .select("-createdAt -updatedAt -__v")
    .exec((err, assignment_submissions) => {
      if (err || !assignment_submissions) {
        console.log(err);
        return res.status(400).json({
          error:
            "An error occurred while trying to find all assignment_submissions from db " +
            err,
        });
      } else {
        return res.json(assignment_submissions);
      }
    });
};

exports.createAssignmentSubmission = (req, res) => {
  // if (req?.file?.submission){
  //     req.body.submission = []
  //     if (Array.isArray(req.file.submission)){
  //         req.file.submission.forEach((f)=>{
  //             req.body.submission.push(`/uploads/assignment_submissions/${f.newFilename}`)
  //         })
  //     }else{
  //         req.body.submission.push(`/uploads/assignment_submissions/${req.file.submission.newFilename}`);
  //     }
  // }else{
  //     req.body.submission = [];
  // }
  AssignmentSubmission.findOne(
    { assignment: req.body.assignment, student: req.body.student },
    (err, assignmentsubmission) => {
      if (assignmentsubmission) {
        /// IF IT ALREADY EXISTS THEN THE UPLOADED SUBMISSION SHOULD BE DELETED
        // req.body.submission.forEach(submission=>{
        //     removeFile(submission);
        // })
        req.body.submission.forEach((submission) => {
          removeFile(submission.fcs_path);
        });
        return res.status(400).json({
          error:
            "You have already submitted the assignment so please try to update it.",
        });
      } else if (!assignmentsubmission) {
        /// CREATE ASSIGNMENT SUBMISSION IF AND ONLY IF THE STUDENT HAS NOT SUBMITTED BEFORE
        const assignment_submission = new AssignmentSubmission(req.body);
        assignment_submission.save(async (err, assignment_submission) => {
          if (err || !assignment_submission) {
            console.log(err.message);
            // req.body.submission.forEach(submission=>{
            //     removeFile(submission);
            // })
            req.body.submission.forEach((submission) => {
              removeFile(submission.fcs_path);
            });
            return res.status(400).json({
              error:
                err.message ?? "Not able to save assignment_submission in DB",
            });
          } else {
            assignment_submission.populate({
                path: "student",
                select: "-fcmToken -createdAt -updatedAt -__v -semester -password -salt",
              }).then((assignment_submission_populated)=>res.json(assignment_submission_populated));
            // assignment_submission.__v = undefined;
            // assignment_submission.createdAt = undefined;
            // assignment_submission.updatedAt = undefined;
            // return res.json(assignment_submission);
          }
        });
      } else {
        /// IF AN ERROR OCCURS THEN THE UPLOADED SUBMISSION SHOULD BE DELETED
        // req.body.submission.forEach(submission=>{
        //     removeFile(submission);
        // })
        req.body.submission.forEach((submission) => {
          removeFile(submission.fcs_path);
        });
        console.log(err);
        return res.status(400).json({
          error: "Something went wrong",
        });
      }
    }
  );
};

exports.updateAssignmentSubmission = (req, res) => {
  // if(req?.file?.submission){
  //     req.body.submission = []
  //     /// HERE WE CHECK IF ASSIGNMENT SUBMISSIONS HAS QUESTION FILES AND IF IT DOES THEN WE REMOVE THEM FROM FILE SYSTEM
  //     if (req.assignment_submission.submission){
  //         req.assignment_submission.submission.forEach(assignment_question_file=>{
  //             removeFile(assignment_question_file);
  //         })
  //     }
  //     if(Array.isArray(req.file.submission)){
  //         req.file.submission.forEach((f)=>{
  //             req.body.submission.push(`/uploads/assignment_submissions/${f.newFilename}`)
  //         })
  //     }else{
  //         req.body.submission.push(`/uploads/assignment_submissions/${req.file.submission.newFilename}`)
  //     }
  // }
  AssignmentSubmission.findOneAndUpdate(
    { _id: req.assignment_submission._id },
    { $set: req.body },
    { new: true }
  )
    .populate({
      path: "student",
      select: "_id name",
    })
    .select("-createdAt -updatedAt -__v")
    .exec((err, assignment_submission) => {
      if (err || !assignment_submission) {
        console.log(err);
        return res.status(400).json({
          error: "Assignment Submission Update failed",
        });
      }
      return res.json(assignment_submission);
    });
};

exports.deleteAssignmentSubmission = (req, res) => {
  AssignmentSubmission.deleteOne(
    { _id: req.assignment_submission._id },
    (err, removedAssignmentSubmission) => {
      if (err || removedAssignmentSubmission.deletedCount === 0) {
        return res.status(400).json({
          error: "Failed to delete Assignment Submission",
        });
      }
      return res.json({
        message: "Assignment Submission Deleted Successfully",
      });
    }
  );
};
