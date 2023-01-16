const express = require("express");

const router = express.Router();

const {
  getDepartmentById,
  getDepartment,
  getAllDepartments,
  updateDepartment,
  createDepartment,
  deleteDepartment,
} = require("../controllers/department");

const { isSignedIn, isAuthenticated, isAdmin, isTeacher, isStudent, isParent} = require("../controllers/auth");
const { getAdminById } = require("../controllers/admin");
const { validateAllErrors } = require("../utilities/error");
const { check } = require("express-validator");
const {getTeacherById} = require("../controllers/teacher");
const {getStudentById} = require("../controllers/student");
const {getParentById} = require("../controllers/parent");

router.param("adminId", getAdminById);
router.param("departmentId", getDepartmentById);
router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);

/// CREATE DEPARTMENT ROUTE
router.post(
  "/department/create/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  check("name")
      .isLength({ min: 3 })
      .withMessage("name should be atleast 3 char long"),
  check("description")
      .isLength({ min: 3 })
      .withMessage("description should have some content"),
  check("total_years")
      .isNumeric()
      .withMessage("total_years should have a number"),
    validateAllErrors,
  createDepartment
);

/// GET DEPARTMENT ROUTE FOR ALL USERS
router.get("/department/:departmentId/admin/:adminId", isSignedIn,isAuthenticated,isAdmin, getDepartment);
router.get("/department/:departmentId/teacher/:teacherId", isSignedIn,isAuthenticated,isTeacher, getDepartment);
router.get("/department/:departmentId/student/:studentId", isSignedIn,isAuthenticated,isStudent, getDepartment);
router.get("/department/:departmentId/parent/:parentId", isSignedIn,isAuthenticated,isParent, getDepartment);

/// GET ALL DEPARTMENTS ROUTE FOR ALL USERS
router.get("/departments/admin/:adminId", isSignedIn,isAuthenticated,isAdmin, getAllDepartments);
router.get("/departments/teacher/:teacherId", isSignedIn,isAuthenticated,isTeacher, getAllDepartments);
router.get("/departments/student/:studentId", isSignedIn,isAuthenticated,isStudent, getAllDepartments);
router.get("/departments/parent/:parentId", isSignedIn,isAuthenticated,isParent, getAllDepartments);

/// UPDATE DEPARTMENT ROUTE
router.put("/department/:departmentId/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, updateDepartment);

/// DELETE DEPARTMENT ROUTE
router.delete("/department/:departmentId/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, deleteDepartment);

module.exports = router;