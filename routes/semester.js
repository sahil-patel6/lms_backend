const express = require("express");
const router = express.Router();

const {
  getSemesterById,
  getSemester,
  getAllSemestersByDepartment,
  checkIfDepartmentExists,
  updateSemester,
  createSemester,
  deleteSemester,
} = require("../controllers/semester");

const { isSignedIn, isAuthenticated, isAdmin, isTeacher, isStudent, isParent} = require("../controllers/auth");
const { getAdminById } = require("../controllers/admin");

const { validateAllErrors } = require("../utilities/error");
const { check } = require("express-validator");
const {getTeacherById} = require("../controllers/teacher");
const {getStudentById} = require("../controllers/student");
const {getParentById} = require("../controllers/parent");

router.param("adminId", getAdminById);
router.param("semesterId", getSemesterById);
router.param("teacherId",getTeacherById);
router.param("studentId",getStudentById);
router.param("parentId",getParentById);

/// CREATE SEMESTER ROUTE
router.post(
  "/semester/create/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  check("name")
      .isLength({ min: 3 })
      .withMessage("name should be atleast 3 char long"),
  check("department")
      .isMongoId()
      .withMessage("Department should have a department id"),
    validateAllErrors,
  checkIfDepartmentExists,
  createSemester
);

/// GET SEMESTER ROUTES FOR ALL USERS
router.get("/semester/:semesterId/admin/:adminId",isSignedIn,isAuthenticated,isAdmin, getSemester);
router.get("/semester/:semesterId/teacher/:teacherId",isSignedIn,isAuthenticated,isTeacher, getSemester);
router.get("/semester/:semesterId/student/:studentId",isSignedIn,isAuthenticated,isStudent, getSemester);
router.get("/semester/:semesterId/parent/:parentId",isSignedIn,isAuthenticated,isParent, getSemester);

/// GET SEMESTER BY DEPARTMENT ID ROUTES FOR ALL USERS
router.get("/semesters/:departmentId/admin/:adminId",isSignedIn,isAuthenticated,isAdmin, getAllSemestersByDepartment);
router.get("/semesters/:departmentId/teacher/:teacherId",isSignedIn,isAuthenticated,isTeacher, getAllSemestersByDepartment);
router.get("/semesters/:departmentId/student/:studentId",isSignedIn,isAuthenticated,isStudent, getAllSemestersByDepartment);
router.get("/semesters/:departmentId/parent/:parentId",isSignedIn,isAuthenticated,isParent, getAllSemestersByDepartment);

/// UPDATE SEMESTER ROUTE
router.put(
  "/semester/:semesterId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateSemester
);

/// DELETE SEMESTER ROUTE
router.delete(
  "/semester/:semesterId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteSemester
);

module.exports = router;
