const express = require("express");

const router = express.Router();

const { getAdminById } = require("../controllers/admin");

const {
  getStudentById,
  getStudent,
  getAllStudentsByParent,
  getAllStudentsBySemester,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/student");

const { checkIfSemesterExists } = require("../utilities/middlewares");

const {
  isSignedIn,
  isAuthenticated,
  isAdmin,
  isStudent,
  isTeacher,
  isParent,
} = require("../controllers/auth");
const { handleForm } = require("../utilities/form_handler");
const { check } = require("express-validator");
const { validateAllErrors } = require("../utilities/error");
const { getParentById } = require("../controllers/parent");
const { getTeacherById } = require("../controllers/teacher");

router.param("studentId", getStudentById);
router.param("adminId", getAdminById);
router.param("teacherId", getTeacherById);
router.param("parentId", getParentById);

/// CREATE STUDENT ROUTE
router.post(
  "/student/create/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  check("name")
    .isLength({ min: 3 })
    .withMessage("name should be atleast 3 char long"),
  check("email").isEmail().withMessage("Please enter a valid email"),
  check("phone")
    .isMobilePhone("en-IN")
    .withMessage("Please Enter a valid phone number"),
  check("semester").isMongoId().withMessage("Semester should be semester Id"),
  check("roll_number").isString().withMessage("roll_number cannot be empty"),
  check("plainPassword")
    .isLength({ min: 8 })
    .withMessage("password should be minimum 8 characters long"),
  validateAllErrors,
  checkIfSemesterExists,
  createStudent
);

/// GET STUDENT ROUTE FOR ALL USERS
router.get(
  "/student/:studentId",
  isSignedIn,
  isAuthenticated,
  isStudent,
  getStudent
);
router.get(
  "/student/:studentId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getStudent
);
router.get(
  "/student/:studentId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  getStudent
);
router.get(
  "/student/:studentId/parent/:parentId",
  isSignedIn,
  isAuthenticated,
  isParent,
  getStudent
);

/// GET STUDENTS BY SEMESTER ID
router.get(
  "/students/:semesterId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllStudentsBySemester
);
router.get(
  "/students/:semesterId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  getAllStudentsBySemester
);
router.get(
  "/students/:semesterId/student/:studentId",
  isSignedIn,
  isAuthenticated,
  isStudent,
  getAllStudentsBySemester
);
router.get(
  "/students/:semesterId/parent/:parentId",
  isSignedIn,
  isAuthenticated,
  isParent,
  getAllStudentsBySemester
);

/// GET STUDENTS BY PARENT
router.get(
  "/students/parent/:parentId",
  isSignedIn,
  isAuthenticated,
  isParent,
  getAllStudentsByParent
);

/// UPDATE STUDENT ROUTE CAN EITHER BE USED BY ADMIN OR STUDENT HIMSELF
router.put(
  "/student/:studentId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateStudent
);
router.put(
  "/student/:studentId",
  isSignedIn,
  isAuthenticated,
  isStudent,
  updateStudent
);

/// DELETE STUDENT ROUTE
router.delete(
  "/student/:studentId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteStudent
);

module.exports = router;