const express = require("express");

const router = express.Router();

const {
  getAttendance,
  getAttendanceById,
  attendanceQueryHandler,
  updateAttendance,
  createAttendance,
  deleteAttendance,
} = require("../controllers/attendance");

const {
  isSignedIn,
  isAuthenticated,
  isTeacher,
  isStudent,
  isParent,
} = require("../controllers/auth");
const { validateAllErrors } = require("../utilities/error");
const { check, query } = require("express-validator");
const { getTeacherById } = require("../controllers/teacher");
const { getStudentById } = require("../controllers/student");
const { getParentById } = require("../controllers/parent");

router.param("attendanceId",getAttendanceById);
router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);

/// CREATE ATTENDANCE ROUTE
router.post(
  "/attendance/create/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  check("attendance.*.student")
    .isMongoId()
    .withMessage("Student should be a student ID"),
  check("attendance.*.subject")
    .isMongoId()
    .withMessage("Subject should be a subject ID"),
    check("attendance.*.semester")
      .isMongoId()
      .withMessage("Semester should be a semester ID"),
  check("attendance.*.present")
    .isBoolean()
    .withMessage("present should be a boolean"),
  check("attendance.*.date")
    .isISO8601()
    .withMessage("date should be in proper date ISO String format"),
  validateAllErrors,
  createAttendance
);

/// GET ATTENDANCE ROUTES FOR ALL USERS EXCEPT ADMIN
router.get(
  "/attendance/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  query("start_date")
    .isISO8601()
    .withMessage("start_date should be in proper date ISO String format"),
  query("end_date")
    .isISO8601()
    .withMessage("end_date should be in proper date ISO String format"),
  validateAllErrors,
  attendanceQueryHandler,
  getAttendance
);
router.get(
  "/attendance/student/:studentId",
  isSignedIn,
  isAuthenticated,
  isStudent,
  getAttendance
);
router.get(
  "/attendance/parent/:parentId",
  isSignedIn,
  isAuthenticated,
  isParent,
  getAttendance
);

/// UPDATE ROUTE FOR ATTENDANCE
router.put(
  "/attendance/:attendanceId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  updateAttendance
);

/// DELETE ROUTE FOR ATTENDANCE FOR A PARTICULAR DATE AND SUBJECT MAYBE
router.delete(
  "/attendance/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  query("start_date")
    .isISO8601()
    .withMessage("start_date should be in proper date ISO String format"),
  query("end_date")
    .isISO8601()
    .withMessage("end_date should be in proper date ISO String format"),
  validateAllErrors,
  deleteAttendance
);

module.exports = router;
