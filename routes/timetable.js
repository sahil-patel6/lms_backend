const express = require("express");

const router = express.Router();

const {
  getTimetableById,
  getTimetable,
  getTimetableBySemester,
  checkIfDepartmentAndSemesterExists,
  updateTimetable,
  createTimetable,
  deleteTimetable,
  setTimetableUploadDir,
} = require("../controllers/timetable");

const { isSignedIn, isAuthenticated, isTeacher, isStudent, isParent} = require("../controllers/auth");
const {validateAllErrors} = require("../utilities/error")
const { check } = require("express-validator");
const {handleForm} = require("../utilities/form_handler");
const {getTeacherById} = require("../controllers/teacher");
const {getStudentById} = require("../controllers/student");
const {getParentById} = require("../controllers/parent");


router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);
router.param("timetableId", getTimetableById);

/// CREATE TIMETABLE ROUTE
router.post(
  "/timetable/create/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  setTimetableUploadDir,
  handleForm,
    check("semester")
        .isMongoId()
        .withMessage("Semester should be a semester ID"),
    check("department")
        .isMongoId()
        .withMessage("Department should be a department ID"),
    validateAllErrors,
  checkIfDepartmentAndSemesterExists,
  createTimetable
);

/// GET TIMETABLE ROUTES FOR ALL USERS EXCEPT ADMIN
router.get( "/timetable/:timetableId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getTimetable);
router.get( "/timetable/:timetableId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getTimetable);
router.get( "/timetable/:timetableId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getTimetable);

/// GET TIMETABLE BY SEMESTER ID ROUTES FOR ALL USERS
router.get( "/timetable/semester/:semesterId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getTimetableBySemester);
router.get( "/timetable/semester/:semesterId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getTimetableBySemester);
router.get( "/timetable/semester/:semesterId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getTimetableBySemester);

/// UPDATE ROUTE FOR TIMETABLE
router.put(
  "/timetable/:timetableId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  setTimetableUploadDir,
  handleForm,
  updateTimetable
);

/// DELETE ROUTE FOR timetable
router.delete(
  "/timetable/:timetableId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  deleteTimetable
);

module.exports = router;
