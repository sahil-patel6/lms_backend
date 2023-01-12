const express = require("express");

const router = express.Router();

const {
    getAssignmentById,
    getAssignment,
    getAllAssignmentsBySubject,
    updateAssignment,
    createAssignment,
    deleteAssignment,
    setAssignmentUploadDir,
} = require("../controllers/assignment");

const { isSignedIn, isAuthenticated, isAdmin, isTeacher, isStudent, isParent} = require("../controllers/auth");
const {getAdminById} =  require("../controllers/admin");
const {validateAllErrors} = require("../utilities/error")
const { check } = require("express-validator");
const {handleForm} = require("../utilities/form_handler");
const {getTeacherById} = require("../controllers/teacher");
const {getStudentById} = require("../controllers/student");
const {getParentById} = require("../controllers/parent");

router.param("assignmentId",getAssignmentById)
router.param("adminId", getAdminById);
router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);

/// CREATE ASSIGNMENT ROUTE
router.post(
    "/assignment/create/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    setAssignmentUploadDir,
    handleForm,
    check("title")
        .isLength({ min: 3 })
        .withMessage("title should be atleast 3 char long"),
    check("description")
        .isLength({min:5})
        .withMessage("description should be 5 to 150 characters long"),
    check("marks")
        .isNumeric()
        .withMessage("Marks should be a number"),
    check("subject")
        .isMongoId()
        .withMessage("Subject should be a subject ID"),
    // check("dueDate")
    //     .isEmpty()
    //     .withMessage("dueDate should be date"),
    validateAllErrors,
    createAssignment
);

/// GET ASSIGNMENT ROUTES FOR ALL USERS
router.get( "/assignment/:assignmentId/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, getAssignment);
router.get( "/assignment/:assignmentId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getAssignment);
router.get( "/assignment/:assignmentId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getAssignment);
router.get( "/assignment/:assignmentId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getAssignment);

/// GET ALL ASSIGNMENTS BY SUBJECT ID ROUTES FOR ALL USERS
router.get( "/assignments/:subjectId/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, getAllAssignmentsBySubject);
router.get( "/assignments/:subjectId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getAllAssignmentsBySubject);
router.get( "/assignments/:subjectId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getAllAssignmentsBySubject);
router.get( "/assignments/:subjectId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getAllAssignmentsBySubject);

/// UPDATE ROUTE FOR ASSIGNMENT
router.put(
    "/assignment/:assignmentId/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    setAssignmentUploadDir,
    handleForm,
    updateAssignment
);

/// DELETE ROUTE FOR ASSIGNMENT
router.delete(
    "/assignment/:assignmentId/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    deleteAssignment
);

module.exports = router;