const Semester = require("../models/semester");
const Department = require("../models/department");

exports.getSemesterById = (req, res, next, id) => {
  Semester.findById(id)
    .populate({
      path: "subjects",
      select: "-__v -createdAt -updatedAt",
    //   populate: { path: "resources", select: "-__v" },
    })
    .populate(
      {
        path:"department",
        select: "-__v -createdAt -updatedAt -semesters -_id",
      },
    )
    .exec((err, semester) => {
      if (err || !semester) {
        console.log(err);
        return res.status(400).json({
          error: "No semester Found",
        });
      }
      req.semester = semester._doc;
      next();
    });
};

exports.getSemester = (req, res) => {
  req.semester.createdAt = undefined;
  req.semester.updatedAt = undefined;
  req.semester.__v = undefined;
  return res.json(req.semester);
};

exports.getAllSemestersByDepartment = (req,res) => {
  Semester.find({department:req.params.departmentId}).populate({
    path: "subjects",
    select: "-__v -createdAt -updatedAt",
  //   populate: { path: "resources", select: "-__v" },
  })
  .populate({
      path:"department",
      select: "-__v -createdAt -updatedAt -semesters ",
    })
      .select("-createdAt -updatedAt -__v")
      .exec((err,semesters)=>{
      if (err || !semesters) {
          console.log(err);
          return res.status(400).json({
              error: "An error occurred while trying to find all semesters from db " + err,
          });
      }else{
          return res.json({semesters});
      }
  })
}

exports.createSemester = (req, res) => {
  const semester = new Semester(req.body);
  semester.save((err, semester) => {
    if (err || !semester) {
      console.log(err);
      return res.status(400).json({
        error: "Not able to save semester in DB",
      });
    } else {
      semester.createdAt = undefined;
      semester.updatedAt = undefined;
      semester.__v = undefined;
      return res.json(semester);
    }
  });
};

exports.updateSemester = (req, res) => {
  Semester.findOneAndUpdate(
    { _id: req.semester._id },
    { $set: req.body },
    { new: true })
      .select("-createdAt -updatedAt -__v")
      .exec((err, semester) => {
      if (err || !semester) {
        return res.status(400).json({
          error: "Update failed",
        });
      }
      return res.json(semester);
    }
  );
};

exports.deleteSemester = (req, res) => {
  Semester.deleteOne({ _id: req.semester._id }, (err, removedSemester) => {
    if (err || removedSemester.deletedCount === 0) {
      console.log(err)
      return res.status(400).json({
        error: "Failed to delete Semester",
      });
    }
    return res.json({
        message: `${req.semester.name} Semester From ${req.semester.department.name} Deleted Successfully`,
    });
  });
};
