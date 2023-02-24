const express = require("express");

const router = express.Router();

const {
    getNoticeById,
    getNotice,
    getNoticeBySemester,
    updateNotice,
    createNotice,
    deleteNotice,
    setNoticeUploadDir,
} = require("../controllers/notice");

const { checkIfSemesterExists } = require("../utilities/middlewares")

const { isSignedIn, isAuthenticated, isTeacher, isStudent, isParent } = require("../controllers/auth");
const { validateAllErrors } = require("../utilities/error")
const { check } = require("express-validator");
const { handleForm } = require("../utilities/form_handler");
const { getTeacherById } = require("../controllers/teacher");
const { getStudentById } = require("../controllers/student");
const { getParentById } = require("../controllers/parent");


router.param("teacherId", getTeacherById);
router.param("studentId", getStudentById);
router.param("parentId", getParentById);
router.param("noticeId", getNoticeById);

/// CREATE NOTICE ROUTE
router.post(
    "/notice/create/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    check("title")
        .isLength({ min: 3 })
        .withMessage("title should be atleast 3 char long"),
    check("description")
        .isLength({ min: 3 })
        .withMessage("description should have some content"),
    check("semester")
        .isMongoId()
        .withMessage("Semester should be a semester ID"),
    validateAllErrors,
    checkIfSemesterExists,
    createNotice
);

/// GET NOTICE ROUTES FOR ALL USERS EXCEPT ADMIN
router.get("/notice/:noticeId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getNotice);
router.get("/notice/:noticeId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getNotice);
router.get("/notice/:noticeId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getNotice);

/// GET NOTICE BY SEMESTER ID ROUTES FOR ALL USERS
router.get("/notice/semester/:semesterId/teacher/:teacherId", isSignedIn, isAuthenticated, isTeacher, getNoticeBySemester);
router.get("/notice/semester/:semesterId/student/:studentId", isSignedIn, isAuthenticated, isStudent, getNoticeBySemester);
router.get("/notice/semester/:semesterId/parent/:parentId", isSignedIn, isAuthenticated, isParent, getNoticeBySemester);

/// UPDATE ROUTE FOR NOTICE
router.put(
    "/notice/:noticeId/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    updateNotice
);

/// DELETE ROUTE FOR NOTICE
router.delete(
    "/notice/:noticeId/teacher/:teacherId",
    isSignedIn,
    isAuthenticated,
    isTeacher,
    deleteNotice
);

module.exports = router;
