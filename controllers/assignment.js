const Assignment = require("../models/assignment");
const AssignmentSubmission = require("../models/assignment_submission");
const Subject = require("../models/subject");

exports.setAssignmentUploadDir = (req, res, next)=>{
    const fs = require('fs');
    const dir = `${__dirname}/../public/uploads/assignments/`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
    req.uploadDir = dir;
    next();
}

exports.getAssignmentById = (req, res, next, id) => {
    Assignment.findById(id)
        .populate({
            path: "subject",
            select: "_id name semester department teacher",
            populate: {path: "semester department teacher", select:"_id name"}
        })
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
        .populate({
            path: "subject",
            select: "_id name semester department teacher",
            populate: {path: "semester department teacher", select:"_id name"}
        })
        .select("-createdAt -updatedAt -__v")
        .exec((err, assignments) => {
            if (err || !assignments) {
                console.log(err);
                res.status(400).json({
                    error:
                        "An error occurred while trying to find all assignments from db " +
                        err,
                });
            } else {
                return res.json({assignments});
            }
        });
};

exports.createAssignment = (req, res,next) => {
    if (req?.file?.assignment_question_files){
        req.body.assignment_question_files = []
        if (Array.isArray(req.file.assignment_question_files)){
            req.file.assignment_question_files.forEach((f)=>{
                req.body.assignment_question_files.push(`/uploads/assignments/${f.newFilename}`)
            })
        }else{
            req.body.assignment_question_files.push(`/uploads/assignments/${f.newFilename}`);
        }
    }else{
        req.body.assignment_question_files = [];
    }
    const assignment = new Assignment(req.body);
    assignment.save((err, assignment) => {
        if (err || !assignment) {
            console.log(err);
            res.status(400).json({
                error: "Not able to save assignment in DB",
            });
        } else {
            Subject.updateOne(
                { _id: assignment.subject },
                { $push: { assignments: assignment._id } },
                (err, op) => {
                    if (err || op.modifiedCount === 0) {
                        console.log(err);
                        res.status(400).json({
                            error: "Not able to save assignment in semester",
                        });
                    } else {
                        assignment.__v = undefined;
                        assignment.createdAt = undefined;
                        assignment.updatedAt = undefined;
                        res.json(assignment);
                    }
                }
            );
        }
    });
}

exports.updateAssignment = (req, res) => {
    if(req?.file?.assignment_question_files){
        req.body.assignment_question_files = []
        if(Array.isArray(req.file.assignment_question_files)){
            req.file.assignment_question_files.forEach((f)=>{
                req.body.assignment_question_files.push(`/uploads/assignments/${f.newFilename}`)
            })
        }else{
            req.body.assignment_question_files.push(`/uploads/assignments/${f.newFilename}`)
        }
    }
    Assignment.findByIdAndUpdate(
        { _id: req.assignment._id },
        { $set: req.body},
        { new: true })
        .populate("subject","_id name")
        .select("-createdAt -updatedAt -__v")
        .exec((err, assignment) => {
                if (err || !assignment) {
                    console.log(err)
                    return res.status(400).json({
                        error: "Update failed",
                    });
                }
                return res.json(assignment);
            }
        );
};

exports.deleteAssignment = (req, res) => {
    Assignment.deleteOne({ _id: req.assignment._id }, (err, removedAssignment) => {
        if (err || removedAssignment.deletedCount === 0) {
            return res.status(400).json({
                error: "Failed to delete Assignment",
            });
        }
        Subject.updateOne(
            {_id: req.assignment.subject},
            {$pull: {assignments: req.assignment._id}},
            (err, op) => {
                if (err || op.modifiedCount === 0) {
                    console.log(err);
                    return res.status(400).json({
                        error: "Failed to delete Assignment from Semester",
                    });
                }
                AssignmentSubmission.deleteMany(
                    {assignment: req.assignment._id},
                    (err, op) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Failed to delete Assignment Submissions from Assignment",
                            });
                        }
                        return res.json({
                            message: `${req.assignment.title} Assignment Deleted Successfully`,
                        });
                    }
                );
            }
        );
    });
};
