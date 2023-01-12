const AssignmentSubmission = require("../models/assignment_submission");
const Assignment = require("../models/assignment");
const fs = require("fs");

exports.setAssignmentSubmissionUploadDir = (req, res, next)=>{
    const fs = require('fs');
    const dir = `${__dirname}/../public/uploads/assignment_submissions/`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
    req.uploadDir = dir;
    next();
}

exports.getAssignmentSubmissionById = (req, res, next, id) => {
    AssignmentSubmission.findById(id)
        .populate({
            path: "student",
            select: "_id name semester department",
            populate: {path: "semester department", select:"_id name"}
        })
        .populate("assignment","-__v -createdAt -updatedAt -submissions")
        .exec((err, assignment_submission) => {
            if (err || !assignment_submission) {
                console.log(err)
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
    AssignmentSubmission.find({ subject: req.params.subjectId })
        .populate({
            path: "student",
            select: "_id name semester department",
            populate: {path: "semester department", select:"_id name"}
        })
        .populate("assignment","-__v -createdAt -updatedAt -submissions")
        .select("-createdAt -updatedAt -__v")
        .exec((err, assignment_submissions) => {
            if (err || !assignment_submissions) {
                console.log(err);
                res.status(400).json({
                    error:
                        "An error occurred while trying to find all assignment_submissions from db " +
                        err,
                });
            } else {
                return res.json({assignment_submissions});
            }
        });
};

exports.createAssignmentSubmission = (req, res,next) => {
    if (req?.file?.submission){
        req.body.submission = []
        if (Array.isArray(req.file.submission)){
            req.file.submission.forEach((f)=>{
                req.body.submission.push(`/uploads/assignment_submissions/${f.newFilename}`)
            })
        }else{
            req.body.submission.push(`/uploads/assignment_submissions/${f.newFilename}`);
        }
    }else{
        req.body.submission = [];
    }
    AssignmentSubmission.findOne({assignment:req.body.assignment,student:req.body.student},(err,assignmentsubmission)=>{
        if(assignmentsubmission){
            return res.status(400).json({
                error: "You have already submitted the assignment so please try to update it."
            })
        }else if (!assignmentsubmission){
            /// CREATE ASSSIGNMENT SUBMISSION IF AND ONLY IF THE STUDENT HAS NOT SUBMITTED BEFORE
            const assignment_submission = new AssignmentSubmission(req.body);
            assignment_submission.save((err, assignment_submission) => {
                if (err || !assignment_submission) {
                    console.log(err);
                    return res.status(400).json({
                        error: "Not able to save assignment_submission in DB",
                    });
                } else {
                    Assignment.updateOne(
                        { _id: assignment_submission.assignment },
                        { $push: { submissions: assignment_submission._id } },
                        (err, op) => {
                            if (err || op.modifiedCount === 0) {
                                console.log(err);
                                return res.status(400).json({
                                    error: "Not able to save assignment_submission in Assignment",
                                });
                            } else {
                                assignment_submission.__v = undefined;
                                assignment_submission.createdAt = undefined;
                                assignment_submission.updatedAt = undefined;
                                return res.json(assignment_submission);
                            }
                        }
                    );
                }
            });
        }else{
            console.log(err);
            return res.status(400).json({
                error: "Something went wrong"
            })
        }
    })
}

exports.updateAssignmentSubmission = (req, res) => {
    if(req?.file?.submission){
        req.body.submission = []
        if(Array.isArray(req.file.submission)){
            req.file.submission.forEach((f)=>{
                req.body.submission.push(`/uploads/assignment_submissions/${f.newFilename}`)
            })
        }else{
            req.body.submission.push(`/uploads/assignment_submissions/${f.newFilename}`)
        }
    }
    AssignmentSubmission.findByIdAndUpdate(
        { _id: req.assignment_submission._id },
        { $set: req.body},
        { new: true })
        .populate({
            path: "student",
            select: "_id name semester department",
            populate: {path: "semester department", select:"_id name"}
        })
        .populate("assignment","-__v -createdAt -updatedAt -submissions")
        .select("-createdAt -updatedAt -__v")
        .exec((err, assignment_submission) => {
                if (err || !assignment_submission) {
                    console.log(err)
                    return res.status(400).json({
                        error: "Assignment Submission Update failed",
                    });
                }
                return res.json(assignment_submission);
            }
        );
};

exports.deleteAssignmentSubmission = (req, res) => {
    AssignmentSubmission.deleteOne({ _id: req.assignment_submission._id }, (err, removedAssignmentSubmission) => {
        if (err || removedAssignmentSubmission.deletedCount === 0) {
            return res.status(400).json({
                error: "Failed to delete Assignment Submission",
            });
        }
        Assignment.updateOne(
            { _id: req.assignment_submission.assignment },
            { $pull: { submissions: req.assignment_submission._id } },
            (err, op) => {
                if (err || op.modifiedCount === 0) {
                    console.log(err);
                    res.status(400).json({
                        error: "Failed to delete Assignment Submission from Assignment",
                    });
                } else {
                    res.json({
                        message: `${req.assignment_submission.student.name} Assignment Submission Deleted Successfully`,
                    });
                }
            }
        );
    });
};
