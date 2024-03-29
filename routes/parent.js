const express = require("express");

const router = express.Router();

const { getAdminById } = require("../controllers/admin");

const {
  getParentById,
  getParent,
  createParent,
  updateParent,
  deleteParent,
  setParentUploadDir,
  getAllParents,
} = require("../controllers/parent");

const { checkIfStudentsExists } = require("../utilities/middlewares");

const {
  isSignedIn,
  isAuthenticated,
  isAdmin,
  isParent,
  isTeacher,
} = require("../controllers/auth");
const { check } = require("express-validator");
const { getTeacherById } = require("../controllers/teacher");
const { validateAllErrors } = require("../utilities/error");

router.param("parentId", getParentById);
router.param("adminId", getAdminById);
router.param("teacherId", getTeacherById);

/// CREATE PARENT ROUTE
router.post(
  "/parent/create/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  check("name")
    .isLength({ min: 3 })
    .withMessage("name should be atleast 3 char long"),
  check("email").isEmail().withMessage("Please enter a valid email"),
  check("students")
    .isArray()
    .withMessage("Students should contain student id's array"),
  check("plainPassword")
    .isLength({ min: 8 })
    .withMessage("password should be minimum 8 characters long"),
  validateAllErrors,
  checkIfStudentsExists,
  createParent
);

/// GET PARENT ROUTES
router.get(
  "/parents/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllParents
);
router.get(
  "/parent/:parentId/",
  isSignedIn,
  isAuthenticated,
  isParent,
  getParent
);
router.get(
  "/parent/:parentId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getParent
);
router.get(
  "/parent/:parentId/teacher/:teacherId",
  isSignedIn,
  isAuthenticated,
  isTeacher,
  getParent
);

/// UPDATE PARENT ROUTES CAN ONLY BE USED BY EITHER ADMIN OR PARENT HIMSELF
router.put(
  "/parent/:parentId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  checkIfStudentsExists,
  updateParent
);
router.put(
  "/parent/:parentId",
  isSignedIn,
  isAuthenticated,
  isParent,
  updateParent
);

/// DELETE PARENT ROUTE
router.delete(
  "/parent/:parentId/admin/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteParent
);

module.exports = router;
