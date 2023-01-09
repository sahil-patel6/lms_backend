const express = require("express");

const router = express.Router();

const {
  getSubjectById,
  getSubject,
  getAllSubjectsBySemester,
  updateSubject,
  createSubject,
  deleteSubject,
  setSubjectUploadDir,
} = require("../controllers/subject");

const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const {getAdminById} =  require("../controllers/admin");
const {validateAllErrors} = require("../utilities/error")
const { check } = require("express-validator");
const {handleForm} = require("../utilities/form_handler");


router.param("adminId", getAdminById);
router.param("subjectId", getSubjectById);

// routes for creating
router.post(
  "/subject/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  setSubjectUploadDir,
  handleForm,
    check("name")
        .isLength({ min: 3 })
        .withMessage("name should be atleast 3 char long"),
    check("credits")
        .isNumeric()
        .withMessage("credits should be a number"),
    check("semester")
        .isMongoId()
        .withMessage("Semester should be a semester ID"),
    check("department")
        .isMongoId()
        .withMessage("Department should be a semester ID"),
    validateAllErrors,
  createSubject
);

router.get(
  "/subject/:subjectId",
  getSubject
);

router.get(
  "/subjects/:semesterId",
  getAllSubjectsBySemester,
);

router.put(
  "/subject/:subjectId/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  setSubjectUploadDir,
  handleForm,
  updateSubject
);

router.delete(
  "/subject/:subjectId/:adminId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteSubject
);

module.exports = router;
