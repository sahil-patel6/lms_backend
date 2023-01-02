const express = require("express");
const {
  signout,
  student_signin,
  parent_signin,
  admin_signin,
  teacher_signin,
  isSignedIn,
} = require("../controllers/auth");
const router = express.Router();
const {validateAllErrors} = require("../utilities/error")
const { check } = require("express-validator");

router.get("/signout", signout);

router.post(
  "/admin/signin",
  [
    check("email").isEmail().withMessage("email must be valid"),
    check("plainPassword")
      .isLength({ min: 8 })
      .withMessage("password should be atleast 8 char long"),
  ],
  validateAllErrors,
  admin_signin
);

router.post(
  "/student/signin",
  [
    check("email").isEmail().withMessage("email must be valid"),
    check("plainPassword")
      .isLength({ min: 5 })
      .withMessage("password should be atleast 8 char long"),
  ],
  validateAllErrors,
  student_signin
);

router.post(
  "/teacher/signin",
  [
    check("email").isEmail().withMessage("email must be valid"),
    check("plainPassword")
      .isLength({ min: 8 })
      .withMessage("password should be atleast 8 char long"),
  ],
  validateAllErrors,
  teacher_signin
);
router.post(
  "/parent/signin",
  [
    check("email").isEmail().withMessage("email must be valid"),
    check("plainPassword")
      .isLength({ min: 8 })
      .withMessage("password should be atleast 8 char long"),
  ],
  validateAllErrors,
  parent_signin
);


module.exports = router;
