const express = require("express");
const {
  signout,
  student_signin,
  parent_signin,
  admin_signin,
  teacher_signin,
  isSignedIn,
  isAuthenticated,
  isTeacher,
  isStudent,
  isParent,
  signoutTeacher,
  signoutStudent,
  signoutParent,
} = require("../controllers/auth");
const router = express.Router();
const {validateAllErrors} = require("../utilities/error")
const { check } = require("express-validator");
const { getTeacherById } = require("../controllers/teacher");
const { getStudentById } = require("../controllers/student");
const { getParentById } = require("../controllers/parent");

router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);

router.get("/signout", signout);

router.get("/teacher/:teacherId/signout",isSignedIn,isAuthenticated,isTeacher,signoutTeacher);
router.get("/student/:studentId/signout",isSignedIn,isAuthenticated,isStudent,signoutStudent);
router.get("/parent/:parentId/signout",isSignedIn,isAuthenticated,isParent,signoutParent);

router.post(
  "/admin/signin",
  [
    check("email").isEmail().withMessage("Email must be valid"),
    check("plainPassword")
      .isLength({ min: 8 })
      .withMessage("Password should be atleast 8 char long"),
  ],
  validateAllErrors,
  admin_signin
);

router.post(
  "/student/signin",
  [
    check("email").isEmail().withMessage("Email must be valid"),
    check("plainPassword")
      .isLength({ min: 8 })
      .withMessage("Password should be atleast 8 char long"),
  ],
  validateAllErrors,
  student_signin
);

router.post(
  "/teacher/signin",
  [
    check("email").isEmail().withMessage("Email must be valid"),
    check("plainPassword")
      .isLength({ min: 8 })
      .withMessage("Password should be atleast 8 char long"),
  ],
  validateAllErrors,
  teacher_signin
);
router.post(
  "/parent/signin",
  [
    check("email").isEmail().withMessage("Email must be valid"),
    check("plainPassword")
      .isLength({ min: 8 })
      .withMessage("Password should be atleast 8 char long"),
  ],
  validateAllErrors,
  parent_signin
);


module.exports = router;
