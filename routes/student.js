const express = require("express");

const router = express.Router();

const {
    getAdminById,
} = require("../controllers/admin");

const {
    getStudentById,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    setStudentUploadDir
} = require("../controllers/student");

const { isSignedIn, isAuthenticated, isAdmin, isStudent, isAdminOrStudent} = require("../controllers/auth");
const {handleForm} = require("../utilities/form_handler");
const {check} = require("express-validator");
const {validateAllErrors} = require("../utilities/error");

router.param("studentId", getStudentById);
router.param("adminId", getAdminById);

router.post("/student/create/:adminId",isSignedIn,isAuthenticated,isAdmin,setStudentUploadDir,
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
    check("semester")
        .isMongoId()
        .withMessage("Semester should be semester Id"),
    check("department")
        .isMongoId()
        .withMessage("Department should be department Id"),
    check("roll_number")
        .isString()
        .withMessage("Roll No cannot be empty"),
    check("plainPassword")
        .isLength({min: 8})
        .withMessage("password should be minimum 8 characters long"),
    validateAllErrors,
    createStudent)

router.get("/student/:studentId", getStudent);

router.put("/student/:studentId/:adminId", isSignedIn, isAuthenticated, isAdminOrStudent,setStudentUploadDir,handleForm, updateStudent);

router.delete("/student/:studentId/:adminId", isSignedIn, isAuthenticated, isAdmin, deleteStudent);


module.exports = router;
