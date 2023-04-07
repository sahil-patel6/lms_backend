const Department = require("../models/department");
const Parent = require("../models/parent");
const Student = require("../models/student");
const Assignment = require("../models/assignment");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher");
const Semester = require("../models/semester");
const mongoose = require("mongoose");

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
      console.log(req.student.semester._id, assignment.subject.semester);
      if (
        req.student.semester._id.toString() !==
        assignment.subject.semester.toString()
      ) {
        return res.status(400).json({
          error: "Forbidden to create assignment submission",
        });
      }
      next();
    });
};

/// USED IN ASSIGNMENT, RESOURCE
exports.checkIfSubjectAndTeacherExistsAndAreValid = (req, res, next) => {
  Subject.findById(req.body.subject, (err, subject) => {
    if (err || !subject) {
      return res.status(400).json({
        error: "No Subject Found",
      });
    }
    Teacher.findOne(
      {
        subjects: {
          $in: [subject._id],
        },
      },
      (err, teacher) => {
        if (
          err ||
          !teacher ||
          teacher._id.toString() !== req.teacher._id.toString()
        ) {
          return res.status(400).json({
            error: "Forbidden to create resource",
          });
        }
        next();
      }
    );
  });
};

/// USED IN PARENTS
exports.checkIfStudentsExists = (req, res, next) => {
  if (req.body.students) {
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
    Parent.find({
      students: { $in: req.body.students },
      email: {
        $ne: req.body.email,
      },
    })
      .populate("students", "_id name")
      .exec((err, parents) => {
        console.log(parents, req.body.students, "CHECK PARENTS");
        let students_which_has_already_parents = "";
        parents.map((p) => {
          p.students.map((student) => {
            students_which_has_already_parents += req.body.students.find(
              (s) => s == student._id
            )
              ? student.name + ", "
              : "";
          });
        });
        if (err || !parents || parents.length !== 0) {
          return res.status(400).json({
            error: `${students_which_has_already_parents} already have parents`,
          });
        }
        Student.find({ _id: { $in: req.body.students } }, (err, students) => {
          if (
            err ||
            !students ||
            students.length !== req.body.students.length
          ) {
            return res.status(400).json({
              error: "Students not found",
            });
          }
          next();
        });
      });
  } else {
    next();
  }
};

/// USED IN RESULT, STUDENT, SUBJECT, TIMETABLE
exports.checkIfSemesterExists = (req, res, next) => {
  if (req.body.semester || req.params.semesterId) {
    Semester.findOne(
      {
        _id:
          req.body.semester != null ? req.body.semester : req.params.semesterId,
      },
      (err, semester) => {
        if (err || !semester) {
          return res.status(400).json({
            error: "No Semester Found",
          });
        }
        next();
      }
    );
  } else {
    next();
  }
};

/// USED IN SEMESTER
exports.checkIfDepartmentExists = (req, res, next) => {
  if (req.body.department || req.params.departmentId) {
    Department.findById(
      req.body.department != null
        ? req.body.department
        : req.params.departmentId,
      (err, department) => {
        if (err || !department) {
          console.log(err);
          return res.status(400).json({
            error: "No Department found",
          });
        } else {
          req.department = department._doc;
          return next();
        }
      }
    );
  }
};

/// USED IN TEACHER
exports.checkIfSubjectsExists = (req, res, next) => {
  if (req.body.subjects) {
    try {
      req.body.subjects.map((subject) => {
        return new mongoose.mongo.ObjectId(subject);
      });
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        error: "An error occurred while processing subjects",
      });
    }
    Subject.find({ _id: { $in: req.body.subjects } }, (err, subjects) => {
      if (err || !subjects || subjects.length !== req.body.subjects.length) {
        return res.status(400).json({
          error: "Subjects not found",
        });
      }
      Teacher.find({
        subjects: { $in: req.body.subjects },
        email: {
          $ne: req.body.email,
        },
      })
        .populate("subjects", "_id name")
        .exec((err, teachers) => {
          let subjects_which_has_already_teacher = "";
          teachers.map((t) => {
            t.subjects.map((subject) => {
              subjects_which_has_already_teacher += req.body.subjects.find(
                (s) => s == subject._id
              )
                ? subject.name + ", "
                : "";
            });
          });
          if (err || !teachers || teachers.length !== 0) {
            return res.status(400).json({
              error: `${subjects_which_has_already_teacher} already have teachers`,
            });
          }
          next();
        });
    });
  } else {
    next();
  }
};
