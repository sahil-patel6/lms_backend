const express = require("express");

const router = express.Router();

const {
  getResultById,
  getResult,
  getResultBySemester,
  updateResult,
  createResult,
  deleteResult,
  setResultUploadDir,
} = require("../controllers/result");

const {checkIfSemesterExists} = require("../utilities/middlewares")

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
router.param("resultId", getResultById);

/// CREATE RESULT ROUTE
router.post(
  "/result/create/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  setResultUploadDir,
  handleForm,
    check("result_name")
      .isLength({min:3})
      .withMessage("result_name should be atleast 3 chars long"),
    check("semester")
        .isMongoId()
        .withMessage("Semester should be a semester ID"),
    check("department")
        .isMongoId()
        .withMessage("Department should be a department ID"),
    validateAllErrors,
  checkIfSemesterExists,
  createResult
);

/// GET RESULT ROUTES FOR ALL USERS EXCEPT ADMIN
router.get( "/result/:resultId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getResult);
router.get( "/result/:resultId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getResult);
router.get( "/result/:resultId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getResult);

/// GET RESULT BY SEMESTER ID ROUTES FOR ALL USERS
router.get( "/result/semester/:semesterId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getResultBySemester);
router.get( "/result/semester/:semesterId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getResultBySemester);
router.get( "/result/semester/:semesterId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getResultBySemester);

/// UPDATE ROUTE FOR RESULT
router.put(
  "/result/:resultId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  setResultUploadDir,
  handleForm,
  updateResult
);

/// DELETE ROUTE FOR RESULT
router.delete(
  "/result/:resultId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  deleteResult
);

module.exports = router;
