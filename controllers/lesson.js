const Lesson = require("../models/lesson");
const Subject = require("../models/subject");
const fs = require("fs");
const {removeFile} = require("../utilities/remove_file");

exports.setLessonUploadDir = (req, res, next)=>{
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
                return res.status(400).json({
                    error:
                        "An error occurred while trying to find all lessons from db " +
                        err,
                });
            } else {
                return res.json({lessons});
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
            /// REMOVING FILES IF IT EXISTS BECAUSE OF ERROR
            req.body.files.forEach(file=>{
                removeFile(file);
            })
            return res.status(400).json({
                error: "Not able to save lesson in DB",
            });
        } else {
            lesson.__v = undefined;
            lesson.createdAt = undefined;
            lesson.updatedAt = undefined;
            return res.json(lesson);
        }
    });
}

exports.updateLesson = (req, res) => {
    if(req?.file?.files){
        /// HERE WE CHECK IF LESSON HAS FILES AND IF IT DOES THEN WE REMOVE THEM FROM FILE SYSTEM
        if (req.lesson.files){
            req.lesson.files.forEach(file=>{
                removeFile(file)
            })
        }
        req.body.files = []
        req.file.files.forEach((f)=>{
            req.body.files.push(`/uploads/lessons/${f.newFilename}`)
        })
    }
    Lesson.findOneAndUpdate(
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
    /// DELETING LESSON
    Lesson.deleteOne({ _id: req.lesson._id }, (err, removedLesson) => {
        if (err || removedLesson.deletedCount === 0) {
            return res.status(400).json({
                error: "Failed to delete Lesson",
            });
        }
        return res.json({
            message: `${req.lesson.title} Lesson Deleted Successfully`,
        });
    });
};
