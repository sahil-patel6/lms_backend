const Admin = require("../models/admin");
const Parent = require("../models/parent");
const Teacher = require("../models/teacher");
const Student = require("../models/student");
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId;
const jwt = require("jsonwebtoken");
const {expressjwt} = require("express-jwt");

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "user signed out successfully",
  });
};

exports.signoutTeacher = async (req, res) => {
  const teacher = await Teacher.updateOne({_id:ObjectId(req.params.teacherId)},{fcm_token:""},{new:true});
  console.log(teacher);
  res.json({
    message: "Teacher signed out successfully",
  });
};

exports.signoutStudent = async (req, res) => {
  await Student.updateOne({_id:ObjectId(req.params.studentId)},{fcm_token:""});
  res.json({
    message: "Student signed out successfully",
  });
};

exports.signoutParent = async (req, res) => {
  await Parent.updateOne({_id:ObjectId(req.params.parentId)},{fcm_token:""});
  res.json({
    message: "Parent signed out successfully",
  });
};

exports.admin_signin = (admin, res) => {
  const { email, plainPassword } = admin.body;

  Admin.findOne({ email })
      .select("-createdAt")
      .exec( (err, admin) => {
    if (err || !admin) {
      return res.status(400).json({
        error: "admin Email Doesn't exist",
      });
    }
    if (!admin.authenticate(plainPassword)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }
    const token = jwt.sign({ _id: admin._id }, process.env.SECRET);

    res.cookie("token", token, {
      expire: new Date() + 9999,
    });
    admin.salt = undefined;
    admin.password = undefined;
    admin.createdAt = undefined;
    admin.updatedAt = undefined;
    admin.__v = undefined;
    return res.status(200).json({
      token,
      ...admin._doc
    });
  });
};

exports.student_signin = (req, res) => {
  const { email, plainPassword } = req.body;

  Student.findOne({ email })
      .populate("semester","_id name")
      .select("-createdAt")
      .exec( async (err, student) => {
    if (err || !student) {
      return res.status(400).json({
        error: "student Email Doesn't exist",
      });
    }

    if (!student.authenticate(plainPassword)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }
    const token = jwt.sign({ _id: student._id }, process.env.SECRET);
    if (req.body.fcm_token){
      await Student.updateOne({email},{fcm_token:req.body.fcm_token});
    }
    res.cookie("token", token, {
      expire: new Date() + 9999,
    });
    student.salt = undefined;
    student.password = undefined;
    student.createdAt = undefined;
    student.updatedAt = undefined;
    student.__v = undefined;
    return res.status(200).json({
      token,
      ...student._doc,
    });
  });
};

exports.teacher_signin = (req, res) => {
  const { email, plainPassword } = req.body;

  Teacher.findOne({ email })
      .populate({
        path: "subjects",
        select: "_id name semester",
        populate: { path: "semester", select: "_id name" },
      })
      .select("-createdAt")
      .exec( async (err, teacher) => {
    if (err || !teacher) {
      return res.status(400).json({
        error: "teacher Email Doesn't exist",
      });
    }

    if (!teacher.authenticate(plainPassword)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }
    const token = jwt.sign({ _id: teacher._id }, process.env.SECRET);
    if (req.body.fcm_token){
      await Teacher.updateOne({email},{fcm_token:req.body.fcm_token});
    }
    res.cookie("token", token, {
      expire: new Date() + 9999,
    });
    teacher.salt = undefined;
    teacher.password = undefined;
    teacher.createdAt = undefined;
    teacher.updatedAt = undefined;
    teacher.__v = undefined;
    return res.status(200).json({
      token,
      ...teacher._doc,
    });
  });
};

exports.parent_signin = (req, res) => {
  const { email, plainPassword } = req.body;

  Parent.findOne({ email })
      .populate({
        path:"students",
        select:"-salt -password -createdAt -updatedAt -__v",
        populate: { path: "semester", select: "_id name"}
      })
      .select("-createdAt")
      .exec(async  (err, parent) => {
    if (err || !parent) {
		console.log(err);
      return res.status(400).json({
        error: "Parent Email Doesn't exist",
      });
    }

    if (!parent.authenticate(plainPassword)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }
    const token = jwt.sign({ _id: parent._id }, process.env.SECRET);
    if (req.body.fcm_token){
      await Parent.updateOne({email},{fcm_token:req.body.fcm_token});
    }
    res.cookie("token", token, {
      expire: new Date() + 9999,
    });
    parent.salt = undefined;
    parent.password = undefined;
    parent.createdAt = undefined;
    parent.updatedAt = undefined;
    parent.__v = undefined;
    return res.status(200).json({
      token,
      ...parent._doc,
    });
  });
};

exports.isSignedIn = expressjwt({
  secret: process.env.SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

exports.isAuthenticated = (req, res, next) => {
  let id;
  if (req?.admin?._id == req?.auth?._id) {
    id = req.admin._id;
    req.isAdmin = true;
  } else if (req?.teacher?._id == req?.auth?._id) {
    id = req.teacher._id;
    req.isTeacher = true;
  } else if (req?.student?._id == req?.auth?._id) {
    id = req.student._id;
    req.isStudent = true;
  } else if (req?.parent?._id == req?.auth?._id) {
    id = req.parent._id;    
    req.isParent = true;
  }
//   let checker = id && req.auth && id == req.auth._id;
  // console.log(id, req.auth);
  if (!id) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({
      error: "You are not Admin, ACCESS DENIED",
    });
  }
  next();
};
exports.isTeacher = (req, res, next) => {
  if (!req.isTeacher) {
    return res.status(403).json({
      error: "You are not Teacher, ACCESS DENIED",
    });
  }
  next();
};
exports.isParent = (req, res, next) => {
  if (!req.isParent) {
    return res.status(403).json({
      error: "You are not Parent, ACCESS DENIED",
    });
  }
  next();
};
exports.isStudent = (req, res, next) => {
  if (!req.isStudent) {
    return res.status(403).json({
      error: "You are not Student, ACCESS DENIED",
    });
  }
  next();
};