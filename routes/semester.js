const express = require("express");
const router = express.Router();

const {
  getSemesterById,
  getSemester,
  getAllSemestersByDepartment,
  updateSemester,
  createSemester,
  deleteSemester,
} = require("../controllers/semester");

const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getAdminById } = require("../controllers/admin");

const { validateAllErrors } = require("../utilities/error");
const { check } = require("express-validator");

router.param("adminId", getAdminById);
router.param("semesterId", getSemesterById);

// routes for creating
router.post(
  "/semester/:adminId",
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("name should be atleast 3 char long"),
    check("department")
      .isMongoId()
      .withMessage("Department should have a department id"),
  ],
  validateAllErrors,
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createSemester
);

router.get("/semester/:semesterId", getSemester);

router.get("/semesters/:departmentId", getAllSemestersByDepartment);

router.put(
  "/semester/:semesterId/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateSemester
);

router.delete(
  "/semester/:semesterId/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteSemester
);

module.exports = router;
