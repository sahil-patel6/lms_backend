const express = require("express");

const router = express.Router();

const {
    getAdminById,
} = require("../controllers/admin");

const {
    getParentById,
    getParent,
    createParent,
    updateParent,
    deleteParent,
} = require("../controllers/parent");

const { isSignedIn, isAuthenticated, isAdmin, isParent, isAdminOrParent} = require("../controllers/auth");

router.param("parentId", getParentById);
router.param("adminId", getAdminById);

router.post("/parent/create/:adminId",isSignedIn,isAuthenticated,isAdmin,createParent)

router.get("/parent/:parentId", getParent);

router.put("/parent/:parentId/:adminId", isSignedIn, isAuthenticated, isAdminOrParent, updateParent);

router.delete("/parent/:parentId/:adminId",isSignedIn,isAuthenticated,isAdmin, deleteParent);

module.exports = router;
