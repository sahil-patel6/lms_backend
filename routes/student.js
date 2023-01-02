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
    deleteStudent
} = require("../controllers/student");

const { isSignedIn, isAuthenticated, isAdmin, isStudent, isAdminOrStudent} = require("../controllers/auth");

router.param("studentId", getStudentById);
router.param("adminId", getAdminById);

router.post("/student/create/:adminId",isSignedIn,isAuthenticated,isAdmin,createStudent)

router.get("/student/:studentId", getStudent);

router.put("/student/:studentId/:adminId", isSignedIn, isAuthenticated, isAdminOrStudent, updateStudent);

router.delete("/student/:studentId/:adminId", isSignedIn, isAuthenticated, isAdmin, deleteStudent);


module.exports = router;
