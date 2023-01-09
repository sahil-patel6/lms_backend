const express = require("express");

const router = express.Router();

const {
    getAdminById,
} = require("../controllers/admin");

const {
    getParentById,
    getParent,
    createParent,
    updateParent,
    deleteParent,
    setParentUploadDir
} = require("../controllers/parent");

const { isSignedIn, isAuthenticated, isAdmin, isParent, isAdminOrParent} = require("../controllers/auth");
const {handleForm} = require("../utilities/form_handler");
const {check} = require("express-validator");

router.param("parentId", getParentById);
router.param("adminId", getAdminById);

router.post("/parent/create/:adminId",isSignedIn,isAuthenticated,isAdmin,setParentUploadDir,
    handleForm,
    check("name")
        .isLength({min: 3})
        .withMessage("name should be atleast 3 char long"),
    check("email")
        .isEmail()
        .withMessage("Please enter a valid email"),
    check("phone")
        .isMobilePhone('en-IN')
        .withMessage("Please Enter a valid phone number"),
    check("bio")
        .isLength({min: 5, max: 150})
        .withMessage("Bio should be of 5 to 150 characters"),
    check("address")
        .isLength({min: 5})
        .withMessage("Address cannot be empty or small"),
    check("students")
        .isArray()
        .withMessage("Subjects should contain subject id's array"),
    check("plainPassword")
        .isLength({min: 8})
        .withMessage("password should be minimum 8 characters long"),
    createParent)

router.get("/parent/:parentId", getParent);

router.put("/parent/:parentId/:adminId", isSignedIn, isAuthenticated, isAdminOrParent,setParentUploadDir,handleForm, updateParent);

router.delete("/parent/:parentId/:adminId",isSignedIn,isAuthenticated,isAdmin, deleteParent);

module.exports = router;
