const express = require("express");

const router = express.Router();

const {
    getAdminById,
} = require("../controllers/admin");

const {
    getParentById,
    getParent,
    checkIfStudentsExists,
    createParent,
    updateParent,
    deleteParent,
    setParentUploadDir
} = require("../controllers/parent");

const { isSignedIn, isAuthenticated, isAdmin, isParent, isTeacher} = require("../controllers/auth");
const {handleForm} = require("../utilities/form_handler");
const {check} = require("express-validator");
const {getTeacherById} = require("../controllers/teacher");

router.param("parentId", getParentById);
router.param("adminId", getAdminById);
router.param("teacherId", getTeacherById);

/// CREATE PARENT ROUTE
router.post("/parent/create/admin/:adminId",isSignedIn,isAuthenticated,isAdmin,setParentUploadDir,
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
    checkIfStudentsExists,
    createParent)

/// GET PARENT ROUTES
router.get("/parent/:parentId/",isSignedIn,isAuthenticated,isParent, getParent);
router.get("/parent/:parentId/admin/:adminId",isSignedIn,isAuthenticated,isAdmin, getParent);
router.get("/parent/:parentId/teacher/:teacherId",isSignedIn,isAuthenticated,isTeacher, getParent);

/// UPDATE PARENT ROUTES CAN ONLY BE USED BY EITHER ADMIN OR PARENT HIMSELF
router.put("/parent/:parentId/admin/:adminId", isSignedIn, isAuthenticated, isAdmin,setParentUploadDir,handleForm, updateParent);
router.put("/parent/:parentId", isSignedIn, isAuthenticated, isParent,setParentUploadDir,handleForm, updateParent);

/// DELETE PARENT ROUTE
router.delete("/parent/:parentId/admin/:adminId",isSignedIn,isAuthenticated,isAdmin, deleteParent);

module.exports = router;