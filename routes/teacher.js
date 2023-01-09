const express = require("express");

const router = express.Router();

const {
    getTeacherById,
    getTeacher,
    updateTeacher,
    createTeacher,
    deleteTeacher,
    setTeacherUploadDir
} = require("../controllers/teacher");

const {isSignedIn, isAuthenticated, isAdmin, isTeacher, isAdminOrTeacher} = require("../controllers/auth");
const {getAdminById} = require("../controllers/admin");
const {handleForm} = require("../utilities/form_handler");
const {validateAllErrors} = require("../utilities/error");
const {check} = require("express-validator");

router.param("teacherId", getTeacherById);

router.param("adminId", getAdminById);

router.post("/teacher/create/:adminId", isSignedIn, isAuthenticated, isAdmin, setTeacherUploadDir,
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
    validateAllErrors, createTeacher);

router.get("/teacher/:teacherId", getTeacher);

router.put("/teacher/:teacherId/:adminId", isSignedIn, isAuthenticated, isAdminOrTeacher, setTeacherUploadDir, handleForm, updateTeacher);

router.delete("/teacher/:teacherId/:adminId", isSignedIn, isAuthenticated, isAdmin, deleteTeacher)

module.exports = router;
