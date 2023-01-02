const Admin = require("../models/admin");
const Parent = require("../models/parent");
const Teacher = require("../models/teacher");
const Student = require("../models/student");

const { validationResult } = require("express-validator");

var jwt = require("jsonwebtoken");
var { expressjwt } = require("express-jwt");

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "user signed out successfully",
  });
};

exports.admin_signin = (req, res) => {
  const { email, plainPassword } = req.body;

  Admin.findOne({ email }, (err, admin) => {
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
    const { _id, email } = admin;
    return res.status(200).json({
      token,
      admin: {
        _id,
        email,
      },
    });
  });
};

exports.student_signin = (req, res) => {
  const { email, plainPassword } = req.body;

  Student.findOne({ email }, (err, student) => {
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

    res.cookie("token", token, {
      expire: new Date() + 9999,
    });
    return res.status(200).json({
      token,
      student,
    });
  });
};

exports.teacher_signin = (req, res) => {
  const { email, plainPassword } = req.body;

  Teacher.findOne({ email }, (err, teacher) => {
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

    res.cookie("token", token, {
      expire: new Date() + 9999,
    });
    return res.status(200).json({
      token,
      teacher,
    });
  });
};

exports.parent_signin = (req, res) => {
  const { email, plainPassword } = req.body;

  Parent.findOne({ email }, (err, parent) => {
    if (err || !parent) {
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

    res.cookie("token", token, {
      expire: new Date() + 9999,
    });
    return res.status(200).json({
      token,
      parent,
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

exports.isAdminOrTeacher = (req,res,next) => {
    if (!(req.isTeacher || req.isAdmin)){
        return res.status(403).json({
            error: "You are not Teacher or Admin, ACCESS DENIED",
          }); 
    }
    next();
}

exports.isAdminOrStudent = (req,res,next) => {
  if (!(req.isStudent || req.isAdmin)){
      return res.status(403).json({
          error: "You are not Student or Admin, ACCESS DENIED",
        }); 
  }
  next();
}
exports.isAdminOrParent = (req,res,next) => {
  if (!(req.isParent || req.isAdmin)){
      return res.status(403).json({
          error: "You are not Parent or Admin, ACCESS DENIED",
        }); 
  }
  next();
}