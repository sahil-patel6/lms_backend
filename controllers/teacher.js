const Teacher = require("../models/teacher");
const Subject = require("../models/subject")
const fs = require('fs');
const mongoose = require("mongoose")
const {removeFile} = require("../utilities/remove_file");

exports.setTeacherUploadDir = (req, res, next) => {
    const dir = `${__dirname}/../public/uploads/teachers/`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
    req.uploadDir = dir;
    next();
}

exports.getTeacherById = (req, res, next, id) => {
    Teacher.findById(id)
        .populate("subjects","_id name")
        .exec((err, teacher) => {
        if (err || !teacher) {
            return res.status(400).json({
                error: "No teacher Found",
            });
        }
        req.teacher = {
            ...teacher._doc,
        };
        next();
    });
};

exports.getTeacher = (req, res) => {
    req.teacher.salt = undefined;
    req.teacher.password = undefined;
    req.teacher.createdAt = undefined;
    req.teacher.updatedAt = undefined;
    req.teacher.__v = undefined;
    return res.json(req.teacher);
};

exports.checkIfSubjectsExists = (req,res,next) =>{
    try{
        req.body.subjects.map(subject=>{
            return new mongoose.mongo.ObjectId(subject)
        })
    } catch (e){
        console.log(e);
        return res.status(400).json({
            error: "An error occurred while processing subjects"
        })
    }
    Subject.find({_id:{$in:req.body.subjects}},(err,subjects)=>{
        if (err || !subjects || subjects.length !== req.body.subjects.length){
            return res.status(400).json({
                error: "Subjects not found"
            })
        }
        next();
    })
}

exports.createTeacher = (req, res) => {
    if (req?.file?.profile_pic) {
        console.log(req.file.profile_pic.filepath, req.file.profile_pic.newFilename);
        req.body.profile_pic = `/uploads/teachers/${req.file.profile_pic.newFilename}`;
    } else {
        req.body.pic_url = "";
    }
    const teacher = new Teacher(req.body);
    teacher.save((err, teacher) => {
        if (err || !teacher) {
            console.log(err);
            if (req.body.profile_pic){
                removeFile(req.body.profile_pic);
            }
            return res.status(400).json({
                error: "Not able to save teacher in DB",
            });
        } else {
            teacher.__v = undefined;
            teacher.createdAt = undefined;
            teacher.updatedAt = undefined;
            teacher.password = undefined;
            teacher.salt = undefined;
            return res.json(teacher);
        }
    });
}

exports.updateTeacher = (req, res) => {
    if (req?.file?.profile_pic) {
        /// HERE WE CHECK IF TEACHER HAS PROFILE PIC AND IF IT DOES THEN WE REMOVE PROFILE PIC FROM FILE SYSTEM
        if (req.teacher.profile_pic){
            removeFile(req.teacher.profile_pic);
        }
        console.log(req.file.profile_pic.filepath, req.file.profile_pic.newFilename);
        req.body.profile_pic = `/uploads/teachers/${req.file.profile_pic.newFilename}`;
    }
    Teacher.findOneAndUpdate(
        {_id: req.teacher._id},
        {$set: req.body},
        {new: true})
        .select("-createdAt -updatedAt -__v -salt -password")
        .exec((err, teacher) => {
            if (err || !teacher) {
                console.log(err);
                return res.status(400).json({
                    error: "Update failed",
                });
            }
            if (
                req.body.newPassword &&
                req.body.newPassword.length >= 8 &&
                req.body.currentPassword
            ) {
                if (!teacher.authenticate(req.body.currentPassword)) {
                    return res.status(400).json({
                        error: "Current password is incorrect",
                    });
                }
                teacher.updatePassword(req.body.newPassword, (err, result) => {
                    if (err || result.modifiedCount === 0) {
                        console.log("Failed to update teacher password: ", err);
                        return res.status(400).json({
                            error: "Update failed",
                        });
                    } else {
                        return res.json(teacher);
                    }
                });
            } else {
                console.log("NO need to update teacher password");
                return res.json(teacher);
            }
        }
    );
};

exports.deleteTeacher = (req, res) => {
    Teacher.deleteOne({_id: req.teacher._id}, (err, op) => {
        if (err || op.deletedCount === 0) {
            console.log(err)
            return res.status(400).json({
                error: "Failed to delete Teacher",
            });
        }
        return res.json({
            message: `${req.teacher.name} Teacher Deleted Successfully`,
        });
    });
};
