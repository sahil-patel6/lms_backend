const express = require("express");

const router = express.Router();

const {
  getTeacherById,
  getTeacher,
  updateTeacher,
  createTeacher,
  deleteTeacher,
  setTeacherUploadDir,
  getAllTeachers,
} = require("../controllers/teacher");

const { checkIfSubjectsExists } = require("../utilities/middlewares");

const {
  isSignedIn,
  isAuthenticated,
  isAdmin,
  isTeacher,
  isParent,
  isStudent,
} = require("../controllers/auth");
const { getAdminById } = require("../controllers/admin");
const { getStudentById } = require("../controllers/student");
const { getParentById } = require("../controllers/parent");

const { handleForm } = require("../utilities/form_handler");

const { validateAllErrors } = require("../utilities/error");
const { check } = require("express-validator");

router.param("teacherId", getTeacherById);
router.param("adminId", getAdminById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);

/// CREATE TEACHER ROUTE
router.post(
  "/teacher/create/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  check("name")
    .isLength({ min: 3 })
    .withMessage("name should be atleast 3 char long"),
  check("email").isEmail().withMessage("Please enter a valid email"),
  check("subjects.*")
    .isMongoId()
    .withMessage("Subjects should contain subject id's array"),
  check("plainPassword")
    .isLength({ min: 8 })
    .withMessage("password should be minimum 8 characters long"),
  validateAllErrors,
  checkIfSubjectsExists,
  createTeacher
);

/// GET ROUTES FOR ALL USERS
router.get("/teachers/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, getAllTeachers);
router.get(
  "/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  getTeacher
);
router.get(
  "/teacher/:teacherId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getTeacher
);
router.get(
  "/teacher/:teacherId/student/:studentId",
  isSignedIn,
  isAuthenticated,
  isStudent,
  getTeacher
);
router.get(
  "/teacher/:teacherId/parent/:parentId",
  isSignedIn,
  isAuthenticated,
  isParent,
  getTeacher
);

/// UPDATE TEACHER CAN ONLY BE DONE EITHER BY ADMIN OR TEACHER HIMSELF
router.put(
  "/teacher/:teacherId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  checkIfSubjectsExists,
  updateTeacher
);
router.put(
  "/teacher/:teacherId/",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  checkIfSubjectsExists,
  updateTeacher
);

/// DELETE TEACHER CAN  ONLY BE DONE BY ADMIN
router.delete(
  "/teacher/:teacherId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteTeacher
);

module.exports = router;
