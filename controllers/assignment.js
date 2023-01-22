const Assignment = require("../models/assignment");
const fs = require('fs');
const Subject = require("../models/subject");
const {removeFile} = require("../utilities/remove_file");

exports.setAssignmentUploadDir = (req, res, next)=>{
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
        .populate({
            path:"submissions",
            select: "-createdAt -updatedAt -__v -assignment",
            populate:{path:"student",select:"_id name"}
        }).exec((err, assignment) => {
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
                return res.status(400).json({
                    error:
                        "An error occurred while trying to find all assignments from db " +
                        err,
                });
            } else {
                return res.json({assignments});
            }
        });
};

exports.checkIfSubjectAndTeacherExistsAndAreValid = (req,res,next) =>{
    Subject.findById(req.body.subject,(err,subject)=>{
        if (err || !subject || !subject?.teacher){
            return res.status(400).json({
                error: "No Subject Found"
            })
        }
        console.log(req.teacher._id,subject.teacher);
        if (req.teacher._id.toString() !== subject.teacher._id.toString()){
            return res.status(400).json({
                error: "Forbidden to create lesson"
            })
        }
        next();
    })
}

exports.createAssignment = (req, res,next) => {
    if (req?.file?.assignment_question_files){
        req.body.assignment_question_files = []
        if (Array.isArray(req.file.assignment_question_files)){
            req.file.assignment_question_files.forEach((f)=>{
                req.body.assignment_question_files.push(`/uploads/assignments/${f.newFilename}`)
            })
        }else{
            req.body.assignment_question_files.push(`/uploads/assignments/${req.file.assignment_question_files.newFilename}`);
        }
    }else{
        req.body.assignment_question_files = [];
    }
    const assignment = new Assignment(req.body);
    assignment.save((err, assignment) => {
        if (err || !assignment) {
            console.log(err);
            /// REMOVING ASSIGNMENT QUESTION FILES IF IT EXISTED BECAUSE OF ERROR
            req.body.assignment_question_files.forEach((question)=>{
                removeFile(question);
            })
            return res.status(400).json({
                error: "Not able to save assignment in DB",
            });
        } else {
            assignment.__v = undefined;
            assignment.createdAt = undefined;
            assignment.updatedAt = undefined;
            return res.json(assignment);
        }
    });
}

exports.updateAssignment = (req, res) => {
    if(req?.file?.assignment_question_files){
        req.body.assignment_question_files = []
        /// HERE WE CHECK IF ASSIGNMENT HAS QUESTION FILES AND IF IT DOES THEN WE REMOVE THEM FROM FILE SYSTEM
        if (req.assignment.assignment_question_files){
            req.assignment.assignment_question_files.forEach(assignment_question_file=>{
                removeFile(assignment_question_file);
            })
        }
        if(Array.isArray(req.file.assignment_question_files)){
            req.file.assignment_question_files.forEach((f)=>{
                req.body.assignment_question_files.push(`/uploads/assignments/${f.newFilename}`)
            })
        }else{
            req.body.assignment_question_files.push(`/uploads/assignments/${req.file.assignment_question_files.newFilename}`);
        }
    }
    Assignment.findOneAndUpdate(
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
    /// DELETE ASSIGNMENT
    Assignment.deleteOne({ _id: req.assignment._id }, (err, removedAssignment) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                error: "Failed to delete Assignment",
            });
        }
        return res.json({
            message: `${req.assignment.title} Assignment Deleted Successfully`,
        })
    });
};
