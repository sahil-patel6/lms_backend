const Lesson = require("../models/lesson");
const Subject = require("../models/subject");

exports.setLessonUploadDir = (req, res, next)=>{
    const fs = require('fs');
    const dir = `${__dirname}/../public/uploads/lessons/`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
    req.uploadDir = dir;
    next();
}

exports.getLessonById = (req, res, next, id) => {
    Lesson.findById(id)
        .populate({
            path: "subject",
            select: "_id name semester department teacher",
            populate: {path: "semester department teacher", select:"_id name"}
        })
        .exec((err, lesson) => {
            if (err || !lesson) {
                return res.status(400).json({
                    error: "No Lesson Found",
                });
            }
            req.lesson = lesson._doc;
            next();
        });
};

exports.getLesson = (req, res) => {
    req.lesson.__v = undefined;
    req.lesson.createdAt = undefined;
    req.lesson.updatedAt = undefined;
    return res.json(req.lesson);
};

exports.getAllLessonsBySubject = (req, res) => {
    Lesson.find({ subject: req.params.subjectId })
        .populate({
            path: "subject",
            select: "_id name semester department teacher",
            populate: {path: "semester department teacher", select:"_id name"}
        })
        .select("-createdAt -updatedAt -__v")
        .exec((err, lessons) => {
            if (err || !lessons) {
                console.log(err);
                res.status(400).json({
                    error:
                        "An error occurred while trying to find all lessons from db " +
                        err,
                });
            } else {
                return res.json({lessons});
            }
        });
};

exports.createLesson = (req, res,next) => {
    if (req?.file?.files){
        req.body.files = []
        req.file.files.forEach((f)=>{
            req.body.files.push(`/uploads/lessons/${f.newFilename}`)
        })
    }else{
        req.body.files = [];
    }
    const lesson = new Lesson(req.body);
    lesson.save((err, lesson) => {
        if (err || !lesson) {
            console.log(err);
            res.status(400).json({
                error: "Not able to save lesson in DB",
            });
        } else {
            Subject.updateOne(
                { _id: lesson.subject },
                { $push: { lessons: lesson._id } },
                (err, op) => {
                    if (err || op.modifiedCount === 0) {
                        console.log(err);
                        res.status(400).json({
                            error: "Not able to save lesson in semester",
                        });
                    } else {
                        lesson.__v = undefined;
                        lesson.createdAt = undefined;
                        lesson.updatedAt = undefined;
                        res.json(lesson);
                    }
                }
            );
        }
    });
}

exports.updateLesson = (req, res) => {
    if(req?.file?.files){
        req.body.files = []
        req.file.files.forEach((f)=>{
            req.body.files.push(`/uploads/lessons/${f.newFilename}`)
        })
    }
    Lesson.findByIdAndUpdate(
        { _id: req.lesson._id },
        { $set: req.body},
        { new: true })
        .populate("subject","_id name")
        .select("-createdAt -updatedAt -__v")
        .exec((err, lesson) => {
                if (err || !lesson) {
                    return res.status(400).json({
                        error: "Update failed",
                    });
                }
                return res.json(lesson);
            }
        );
};

exports.deleteLesson = (req, res) => {
    Lesson.deleteOne({ _id: req.lesson._id }, (err, removedLesson) => {
        if (err || removedLesson.deletedCount === 0) {
            return res.status(400).json({
                error: "Failed to delete Lesson",
            });
        }
        Subject.updateOne(
            { _id: req.lesson.subject },
            { $pull: { lessons: req.lesson._id } },
            (err, op) => {
                if (err || op.modifiedCount === 0) {
                    console.log(err);
                    res.status(400).json({
                        error: "Failed to delete Lesson from Semester",
                    });
                } else {
                    res.json({
                        message: `${req.lesson.title} Lesson Deleted Successfully`,
                    });
                }
            }
        );
    });
};
