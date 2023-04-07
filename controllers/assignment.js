const Assignment = require("../models/assignment");
const fs = require("fs");
const { removeFile } = require("../utilities/remove_file");
const agenda = require("../agenda");

exports.setAssignmentUploadDir = (req, res, next) => {
  const dir = `${__dirname}/../public/uploads/assignments/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  req.uploadDir = dir;
  next();
};

exports.getAssignmentById = (req, res, next, id) => {
  Assignment.findById(id)
    .exec((err, assignment) => {
      if (err || !assignment) {
        return res.status(400).json({
          error: "No Assignment Found",
        });
      }
      req.assignment = assignment._doc;
      next();
    });
};

exports.getAssignment = (req, res) => {
  req.assignment.__v = undefined;
  req.assignment.createdAt = undefined;
  req.assignment.updatedAt = undefined;
  return res.json(req.assignment);
};

exports.getAllAssignmentsBySubject = (req, res) => {
  Assignment.find({ subject: req.params.subjectId })
    .select("-createdAt -updatedAt -__v")
    .exec((err, assignments) => {
      if (err || !assignments) {
        console.log(err);
        return res.status(400).json({
          error:
            "An error occurred while trying to find all assignments from db " +
            err,
        });
      } else {
        return res.json( assignments );
      }
    });
};

exports.createAssignment = (req, res, next) => {
  // if (req?.file?.assignment_question_files) {
  //   req.body.assignment_question_files = [];
  //   if (Array.isArray(req.file.assignment_question_files)) {
  //     req.file.assignment_question_files.forEach((f) => {
  //       req.body.assignment_question_files.push(
  //         `/uploads/assignments/${f.newFilename}`
  //       );
  //     });
  //   } else {
  //     req.body.assignment_question_files.push(
  //       `/uploads/assignments/${req.file.assignment_question_files.newFilename}`
  //     );
  //   }
  // } else {
  //   req.body.assignment_question_files = [];
  // }
  const assignment = new Assignment(req.body);
  assignment.save(async (err, assignment) => {
    if (err || !assignment) {
      console.log(err);
      /// REMOVING ASSIGNMENT QUESTION FILES IF IT EXISTED BECAUSE OF ERROR
      // req.body.assignment_question_files.forEach((question) => {
      //   removeFile(question);
      // });
      req.body.assignment_question_files.forEach((question) => {
        removeFile(question.fcs_path);
      });
      /// THIS CODE MEANS THERE IS A DUPLICATE KEY
      if (err.code === 11000){
        const key = Object.keys(err.keyValue);
        const value = Object.values(err.keyValue);
        console.log(Object.keys(err.keyValue))
        console.log(Object.values(err.keyValue))
        return res.status(400).json({
          error: `${key[0]} already exists`
        })
      }
      return res.status(400).json({
        error: "Not able to save assignment in DB",
      });
    } else {
      agenda.now("send assignment created mail", assignment);
      agenda.now("send assignment created notification", assignment);
      agenda.schedule(
        assignment.dueDate,
        "close assignment submission",
        assignment
      );
      assignment.__v = undefined;
      assignment.createdAt = undefined;
      assignment.updatedAt = undefined;
      return res.json(assignment);
    }
  });
};

exports.updateAssignment = (req, res) => {
  // if (req?.file?.assignment_question_files) {
  //   req.body.assignment_question_files = [];
  //   /// HERE WE CHECK IF ASSIGNMENT HAS QUESTION FILES AND IF IT DOES THEN WE REMOVE THEM FROM FILE SYSTEM
  //   if (req.assignment.assignment_question_files) {
  //     req.assignment.assignment_question_files.forEach(
  //       (assignment_question_file) => {
  //         removeFile(assignment_question_file);
  //       }
  //     );
  //   }
  //   if (Array.isArray(req.file.assignment_question_files)) {
  //     req.file.assignment_question_files.forEach((f) => {
  //       req.body.assignment_question_files.push(
  //         `/uploads/assignments/${f.newFilename}`
  //       );
  //     });
  //   } else {
  //     req.body.assignment_question_files.push(
  //       `/uploads/assignments/${req.file.assignment_question_files.newFilename}`
  //     );
  //   }
  // }
  Assignment.findOneAndUpdate(
    { _id: req.assignment._id },
    { $set: req.body },
    { new: true }
  )
    .select("-createdAt -updatedAt -__v")
    .exec(async (err, assignment) => {
      if (err || !assignment) {
        console.log(err);
        /// THIS CODE MEANS THERE IS A DUPLICATE KEY
        if (err.code === 11000){
          const key = Object.keys(err.keyValue);
          const value = Object.values(err.keyValue);
          console.log(Object.keys(err.keyValue))
          console.log(Object.values(err.keyValue))
          return res.status(400).json({
            error: `${key[0]} already exists`
          })
        }
        return res.status(400).json({
          error: "Update failed",
        });
      }
      if (req.body.dueDate) {
        await agenda.cancel({
          name: "close assignment submission",
          "data._id": assignment._id,
        });
        agenda.schedule(
          assignment.dueDate,
          "close assignment submission",
          assignment
        );
      }
      return res.json(assignment);
    });
};

exports.deleteAssignment = (req, res) => {
  /// DELETE ASSIGNMENT
  Assignment.deleteOne(
    { _id: req.assignment._id },
    async (err, removedAssignment) =>  {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: "Failed to delete Assignment",
        });
      }
      await agenda.cancel({
        name: "close assignment submission",
        "data._id": req.assignment._id,
      });
      return res.json({
        message: `${req.assignment.title} Assignment Deleted Successfully`,
      });
    }
  );
};
