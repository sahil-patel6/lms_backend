const express = require("express");
const router = express.Router();
const multer = require("multer");
const path  = require("path")
const agenda = require("../agenda");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,"../uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix +file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload_file", upload.single("file"), (req, res, next) => {
  console.log(req.file);
  res.send("File Uploaded successfully");
});
router.get("/", async (req, res, next) => {
  agenda.now("send user credentials email",{name:"Sahil Patel",email:"goal.sahil6@gmail.com",password: "BLAH"})
  res.send("HEEEY");
});
module.exports = router;
