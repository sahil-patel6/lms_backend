const express = require("express");

const router = express.Router();

const { getAdminById,getAllAdmins, getAdmin, createAdmin, updateAdmin,deleteAdmin } = require("../controllers/admin");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const {validateAllErrors}  = require("../utilities/error")
const { check } = require("express-validator");

router.param("adminId", getAdminById);

router.post("/admin/create",[
    check("name").isLength({min:3}).withMessage("Name should be atleast 3 characters long"),
    check("email").isEmail().withMessage("email must be valid"),
    check("plainPassword")
      .isLength({ min: 8 })
      .withMessage("password should be atleast 8 char long"),
  ],validateAllErrors,createAdmin);

router.get("/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, getAdmin);
router.get("/admin/:adminId/all", isSignedIn, isAuthenticated, isAdmin, getAllAdmins);

router.put("/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, updateAdmin);

router.delete("/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, deleteAdmin);

module.exports = router;
