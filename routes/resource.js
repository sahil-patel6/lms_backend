const express = require("express");

const router = express.Router();

const {
    getResourceById,
    getResource,
    getAllResourcesBySubject,
    updateResource,
    createResource,
    deleteResource,
    setResourceUploadDir,
} = require("../controllers/resource");

const {checkIfSubjectAndTeacherExistsAndAreValid} = require("../utilities/middlewares")

const { isSignedIn, isAuthenticated, isAdmin, isTeacher, isStudent, isParent} = require("../controllers/auth");
const {getAdminById} =  require("../controllers/admin");
const {validateAllErrors} = require("../utilities/error")
const { check } = require("express-validator");
const {handleForm} = require("../utilities/form_handler");
const {getTeacherById} = require("../controllers/teacher");
const {getStudentById} = require("../controllers/student");
const {getParentById} = require("../controllers/parent");

router.param("resourceId",getResourceById)
router.param("adminId", getAdminById);
router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);

/// CREATE RESOURCE ROUTE
router.post(
    "/resource/create/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    check("title")
        .isLength({ min: 3 })
        .withMessage("title should be atleast 3 char long"),
    check("description")
        .isLength({min:5, max:150})
        .withMessage("description should be 5 to 150 characters long"),
    check("subject")
        .isMongoId()
        .withMessage("Subject should be a subject ID"),
    validateAllErrors,
    checkIfSubjectAndTeacherExistsAndAreValid,
    createResource
);

/// GET RESOURCE ROUTES FOR ALL USERS
router.get( "/resource/:resourceId/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, getResource);
router.get( "/resource/:resourceId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getResource);
router.get( "/resource/:resourceId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getResource);
router.get( "/resource/:resourceId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getResource);

/// GET ALL RESOURCES BY SUBJECT ID ROUTES FOR ALL USERS
router.get( "/resources/:subjectId/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, getAllResourcesBySubject);
router.get( "/resources/:subjectId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getAllResourcesBySubject);
router.get( "/resources/:subjectId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getAllResourcesBySubject);
router.get( "/resources/:subjectId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getAllResourcesBySubject);

/// UPDATE ROUTE FOR RESOURCE
router.put(
    "/resource/:resourceId/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    updateResource
);

/// DELETE ROUTE FOR RESOURCE
router.delete(
    "/resource/:resourceId/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    deleteResource
);

module.exports = router;