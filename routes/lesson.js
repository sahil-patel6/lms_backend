const express = require("express");

const router = express.Router();

const {
    getLessonById,
    getLesson,
    getAllLessonsBySubject,
    checkIfSubjectAndTeacherExistsAndAreValid,
    updateLesson,
    createLesson,
    deleteLesson,
    setLessonUploadDir,
} = require("../controllers/lesson");

const { isSignedIn, isAuthenticated, isAdmin, isTeacher, isStudent, isParent} = require("../controllers/auth");
const {getAdminById} =  require("../controllers/admin");
const {validateAllErrors} = require("../utilities/error")
const { check } = require("express-validator");
const {handleForm} = require("../utilities/form_handler");
const {getTeacherById} = require("../controllers/teacher");
const {getStudentById} = require("../controllers/student");
const {getParentById} = require("../controllers/parent");

router.param("lessonId",getLessonById)
router.param("adminId", getAdminById);
router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);

/// CREATE LESSON ROUTE
router.post(
    "/lesson/create/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    setLessonUploadDir,
    handleForm,
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
    createLesson
);

/// GET LESSON ROUTES FOR ALL USERS
router.get( "/lesson/:lessonId/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, getLesson);
router.get( "/lesson/:lessonId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getLesson);
router.get( "/lesson/:lessonId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getLesson);
router.get( "/lesson/:lessonId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getLesson);

/// GET ALL LESSONS BY SUBJECT ID ROUTES FOR ALL USERS
router.get( "/lessons/:subjectId/admin/:adminId", isSignedIn, isAuthenticated, isAdmin, getAllLessonsBySubject);
router.get( "/lessons/:subjectId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getAllLessonsBySubject);
router.get( "/lessons/:subjectId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getAllLessonsBySubject);
router.get( "/lessons/:subjectId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getAllLessonsBySubject);

/// UPDATE ROUTE FOR LESSON
router.put(
    "/lesson/:lessonId/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    setLessonUploadDir,
    handleForm,
    updateLesson
);

/// DELETE ROUTE FOR LESSON
router.delete(
    "/lesson/:lessonId/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    deleteLesson
);

module.exports = router;