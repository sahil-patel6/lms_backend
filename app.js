require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My ROUTES
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const departmentRoutes = require("./routes/department");
const parentRoutes = require("./routes/parent");
const semesterRoutes = require("./routes/semester");
const studentRoutes = require("./routes/student");
const subjectRoutes = require("./routes/subject");
const teacherRoutes = require("./routes/teacher");
const resourceRoutes = require("./routes/resource");
const assignmentRoutes = require("./routes/assignment");
const assignmentSubmissionRoutes = require("./routes/assignment_submission");
const timetableRoutes = require("./routes/timetable");
const resultRoutes = require("./routes/result");
const attendanceRoutes = require("./routes/attendance");
const testRoutes = require("./routes/test");

mongoose
    .set('strictQuery',true)
    .connect(process.env.DATABASE)
    .then( (val)=>{
        console.log("DB connected successfully");
    })
    .catch((err) => console.log(err));

//MiddleWares
app.use(express.static('public'))
app.use(express.json());
app.use(cookieParser());
app.use(cors());

//Routes:
app.use("/api/v1/", adminRoutes);
app.use("/api/v1/", authRoutes);
app.use("/api/v1/", departmentRoutes);
app.use("/api/v1/", parentRoutes);
app.use("/api/v1/", semesterRoutes);
app.use("/api/v1/", studentRoutes);
app.use("/api/v1/", subjectRoutes);
app.use("/api/v1/", teacherRoutes);
app.use("/api/v1/",resourceRoutes)
app.use("/api/v1/",assignmentRoutes)
app.use("/api/v1/",assignmentSubmissionRoutes)
app.use("/api/v1/",timetableRoutes)
app.use("/api/v1/",resultRoutes)
app.use("/api/v1/",attendanceRoutes)
app.use("/api/v1/", testRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`App is running at port ${port}`);
});

