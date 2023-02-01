const Department = require("../models/department")
const Parent = require("../models/parent")
const Student = require("../models/student")
const Assignment = require("../models/assignment");
const Subject = require("../models/subject");

/// USED IN ASSIGNMENT SUBMISSION
exports.checkIfAssignmentAndStudentExistsAndAreValid = (req, res, next) => {
  Assignment.findById(req.body.assignment)
    .populate("subject")
    .exec((err, assignment) => {
      if (err || !assignment) {
        return res.status(400).json({
          error: "No Assignment Found",
        });
      }
      console.log(req.student.semester, assignment.subject.semester);
      if (
        req.student.semester.toString() !==
        assignment.subject.semester.toString()
      ) {
        return res.status(400).json({
          error: "Forbidden to create assignment submission",
        });
      }
      next();
    });
};

/// USED IN ASSIGNMENT
exports.checkIfSubjectAndTeacherExistsAndAreValid = (req, res, next) => {
  Subject.findById(req.body.subject, (err, subject) => {
    if (err || !subject || !subject?.teacher) {
      return res.status(400).json({
        error: "No Subject Found",
      });
    }
    console.log(req.teacher._id, subject.teacher);
    if (req.teacher._id.toString() !== subject.teacher._id.toString()) {
      return res.status(400).json({
        error: "Forbidden to create resource",
      });
    }
    next();
  });
};

/// USED IN PARENTS
exports.checkIfStudentsExists = (req, res, next) => {
  try {
    req.body.students.map((student) => {
      return new mongoose.mongo.ObjectId(student);
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      error: "An error occurred while processing subjects",
    });
  }
  Parent.find({ students: { $in: req.body.students } }, (err, parents) => {
    if (err || !parents || parents.length !== 0) {
      return res.status(400).json({
        error: "Students already have parents",
      });
    }
    console.log(parents);
    Student.find({ _id: { $in: req.body.students } }, (err, students) => {
      if (err || !students || students.length !== req.body.students.length) {
        return res.status(400).json({
          error: "Students not found",
        });
      }
      next();
    });
  });
};

/// USED IN RESOURCES
exports.checkIfSubjectAndTeacherExistsAndAreValid = (req, res, next) => {
  Subject.findById(req.body.subject, (err, subject) => {
    if (err || !subject || !subject?.teacher) {
      return res.status(400).json({
        error: "No Subject Found",
      });
    }
    console.log(req.teacher._id, subject.teacher);
    if (req.teacher._id.toString() !== subject.teacher._id.toString()) {
      return res.status(400).json({
        error: "Forbidden to create resource",
      });
    }
    next();
  });
};

/// USED IN RESULT, STUDENT, SUBJECT, TIMETABLE
exports.checkIfDepartmentAndSemesterExists = (req, res, next) => {
  Department.findById(req.body.department, (err, department) => {
    if (err || !department) {
      return res.status(400).json({
        error: "No department found",
      });
    }
    if (
      !department.semesters.find((semester) => semester == req.body.semester)
    ) {
      return res.status(400).json({
        error: "No Semester found",
      });
    }
    next();
  });
};

/// USED IN SEMESTER
exports.checkIfDepartmentExists = (req, res, next) => {
  Department.findById(req.body.department, (err, department) => {
    if (err || !department) {
      console.log(err);
      return res.status(400).json({
        error: "No Department found",
      });
    } else {
      req.department = department._doc;
      return next();
    }
  });
};

/// USED IN TEACHER
exports.checkIfSubjectsExists = (req,res,next) =>{
    if (req.body.subjects){
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
            return next();
        })
    }else{
        next();
    }
}
