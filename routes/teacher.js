const express = require("express");

const router = express.Router();

const {
    getTeacherById,
    getTeacher,
    updateTeacher,
    createTeacher,
    deleteTeacher
} = require("../controllers/teacher");

const { isSignedIn, isAuthenticated, isAdmin,isTeacher, isAdminOrTeacher} = require("../controllers/auth");
const {getAdminById} = require("../controllers/admin");

router.param("teacherId", getTeacherById);

router.param("adminId", getAdminById);

router.post("/teacher/create/:adminId",isSignedIn,isAuthenticated,isAdmin,createTeacher);

router.get("/teacher/:teacherId", getTeacher);

router.put("/teacher/:teacherId/:adminId", isSignedIn, isAuthenticated,isAdminOrTeacher, updateTeacher);

router.delete("/teacher/:teacherId/:adminId",isSignedIn,isAuthenticated,isAdmin,deleteTeacher)

module.exports = router;
