const express = require("express");

const router = express.Router();

const {
    getAssignmentSubmissionById,
    getAssignmentSubmission,
    getAllAssignmentSubmissionsByAssignment,
    updateAssignmentSubmission,
    createAssignmentSubmission,
    deleteAssignmentSubmission,
} = require("../controllers/assignment_submission");

const {checkIfAssignmentAndStudentExistsAndAreValid} = require("../utilities/middlewares")

const { isSignedIn, isAuthenticated, isAdmin, isTeacher, isStudent, isParent} = require("../controllers/auth");
const {getAdminById} =  require("../controllers/admin");
const {validateAllErrors} = require("../utilities/error")
const { check } = require("express-validator");
const {getTeacherById} = require("../controllers/teacher");
const {getStudentById} = require("../controllers/student");
const {getParentById} = require("../controllers/parent");

router.param("assignment_submissionId",getAssignmentSubmissionById)
router.param("adminId", getAdminById);
router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);

/// CREATE ASSIGNMENT SUBMISSION ROUTE
router.post(
    "/assignment_submission/create/student/:studentId",
    isSignedIn,
    isAuthenticated,
    isStudent,
    check("student")
        .isMongoId()
        .withMessage("student should be student Id"),
    check("assignment")
        .isMongoId()
        .withMessage("assignment should be assignment Id"),
    validateAllErrors,
    checkIfAssignmentAndStudentExistsAndAreValid,
    createAssignmentSubmission
);

/// GET ASSIGNMENT SUBMISSION ROUTES FOR ALL USERS
router.get( "/assignment_submission/:assignment_submissionId/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, getAssignmentSubmission);
router.get( "/assignment_submission/:assignment_submissionId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getAssignmentSubmission);
router.get( "/assignment_submission/:assignment_submissionId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getAssignmentSubmission);
router.get( "/assignment_submission/:assignment_submissionId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getAssignmentSubmission);

/// GET ALL ASSIGNMENT SUBMISSIONS BY ASSIGNMENT ID ROUTES FOR ALL USERS
router.get( "/assignment_submissions/assignment/:assignmentId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getAllAssignmentSubmissionsByAssignment);
router.get( "/assignment_submissions/assignment/:assignmentId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getAllAssignmentSubmissionsByAssignment);

/// UPDATE ROUTE FOR ASSIGNMENT SUBMISSION
router.put(
    "/assignment_submission/:assignment_submissionId/student/:studentId",
    isSignedIn,
    isAuthenticated,
    isStudent,
    updateAssignmentSubmission
);

/// DELETE ROUTE FOR ASSIGNMENT SUBMISSION
router.delete(
    "/assignment_submission/:assignment_submissionId/student/:studentId",
    isSignedIn,
    isAuthenticated,
    isStudent,
    deleteAssignmentSubmission
);

module.exports = router;