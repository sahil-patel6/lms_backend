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

const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getAdminById } = require("../controllers/admin");
const { validateAllErrors } = require("../utilities/error");
const { check } = require("express-validator");

router.param("adminId", getAdminById);
router.param("departmentId", getDepartmentById);

// routes for creating
router.post(
  "/department/:adminId",
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("name should be atleast 3 char long"),
    check("description")
      .isLength({ min: 3 })
      .withMessage("description should have some content"),
    check("total_years")
      .isNumeric()
      .withMessage("total_years should have a number"),
  ],
  validateAllErrors,
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createDepartment
);

router.get("/department/:departmentId", getDepartment);

router.get("/departments/", getAllDepartments);

router.put(
  "/department/:departmentId/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateDepartment
);

router.delete(
  "/department/:departmentId/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteDepartment
);

module.exports = router;
