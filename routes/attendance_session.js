const express = require("express");

const router = express.Router();

const {
  getAttendanceSession,
  getAttendanceSessionById,
  attendanceSessionQueryHandler,
  updateAttendanceSession,
  createAttendanceSession,
  deleteAttendanceSession,
} = require("../controllers/attendance_session");

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

router.param("attendanceSessionId", getAttendanceSessionById);
router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);

/// CREATE ATTENDANCE ROUTE
router.post(
  "/attendance_session/create/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  check("subject")
    .isMongoId()
    .withMessage("Subject should be a subject ID"),
    check("semester")
      .isMongoId()
      .withMessage("Semester should be a semester ID"),
  check("start_time")
    .isISO8601()
    .withMessage("Start time is required"),
  check("end_time")
    .isISO8601()
    .withMessage("End time is required"),
    check("attendances.*.student")
      .isMongoId()
      .withMessage("Subject should be a subject ID"),
  check("attendances.*.present")
    .isBoolean()
    .withMessage("present should be a boolean"),
  validateAllErrors,
  createAttendanceSession
);

/// GET ATTENDANCE ROUTES FOR ALL USERS EXCEPT ADMIN
router.get(
  "/attendance_sessions/teacher/:teacherId",
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
  attendanceSessionQueryHandler,
  getAttendanceSession
);
router.get(
  "/attendance_sessions/student/:studentId",
  isSignedIn,
  isAuthenticated,
  isStudent,  
  attendanceSessionQueryHandler,
  getAttendanceSession
);
router.get(
  "/attendance_sessions/parent/:parentId",
  isSignedIn,
  isAuthenticated,
  isParent,
  attendanceSessionQueryHandler,
  getAttendanceSession
);

/// UPDATE ROUTE FOR ATTENDANCE
router.put(
  "/attendance_session/:attendanceSessionId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  updateAttendanceSession
);

/// DELETE ROUTE FOR ATTENDANCE FOR A PARTICULAR DATE AND SUBJECT MAYBE
router.delete(
  "/attendance_session/:attendanceSessionId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  validateAllErrors,
  deleteAttendanceSession
);

module.exports = router;
