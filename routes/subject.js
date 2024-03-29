const express = require("express");

const router = express.Router();

const {
  getSubjectById,
  getSubject,
  getSubjectsByTeacher,
  getAllSubjectsBySemester,
  updateSubject,
  createSubject,
  deleteSubject,
  getSubjectsByStudent,
} = require("../controllers/subject");

const { checkIfSemesterExists } = require("../utilities/middlewares");

const {
  isSignedIn,
  isAuthenticated,
  isAdmin,
  isTeacher,
  isStudent,
  isParent,
} = require("../controllers/auth");
const { getAdminById } = require("../controllers/admin");
const { validateAllErrors } = require("../utilities/error");
const { check } = require("express-validator");
const { getTeacherById } = require("../controllers/teacher");
const { getStudentById } = require("../controllers/student");
const { getParentById } = require("../controllers/parent");

router.param("adminId", getAdminById);
router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);
router.param("subjectId", getSubjectById);

/// CREATE SUBJECT ROUTE
router.post(
  "/subject/create/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  check("name")
    .isLength({ min: 3 })
    .withMessage("name should be atleast 3 char long"),
  check("credits").isNumeric().withMessage("credits should be a number"),
  check("semester").isMongoId().withMessage("Semester should be a semester ID"),
  validateAllErrors,
  checkIfSemesterExists,
  createSubject
);

/// GET SUBJECT ROUTES FOR ALL USERS
router.get(
  "/subject/:subjectId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getSubject
);
router.get(
  "/subject/:subjectId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  getSubject
);
router.get(
  "/subjects/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  getSubjectsByTeacher
);
router.get(
  "/subjects/student/:studentId",
  isSignedIn,
  isAuthenticated,
  isStudent,
  getSubjectsByStudent
);
router.get(
  "/subject/:subjectId/student/:studentId",
  isSignedIn,
  isAuthenticated,
  isStudent,
  getSubject
);
router.get(
  "/subject/:subjectId/parent/:parentId",
  isSignedIn,
  isAuthenticated,
  isParent,
  getSubject
);

/// GET SUBJECT BY SEMESTER ID ROUTES FOR ALL USERS
router.get(
  "/subjects/:semesterId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  checkIfSemesterExists,
  getAllSubjectsBySemester
);
router.get(
  "/subjects/:semesterId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  checkIfSemesterExists,
  getAllSubjectsBySemester
);
router.get(
  "/subjects/:semesterId/student/:studentId",
  isSignedIn,
  isAuthenticated,
  isStudent,
  checkIfSemesterExists,
  getAllSubjectsBySemester
);
router.get(
  "/subjects/:semesterId/parent/:parentId",
  isSignedIn,
  isAuthenticated,
  isParent,
  checkIfSemesterExists,
  getAllSubjectsBySemester
);

/// UPDATE ROUTE FOR SUBJECT
router.put(
  "/subject/:subjectId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateSubject
);

/// DELETE ROUTE FOR SUBJECT
router.delete(
  "/subject/:subjectId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteSubject
);

module.exports = router;
