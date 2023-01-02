const Semester = require("../models/semester");
const Department = require("../models/department");

exports.getSemesterById = (req, res, next, id) => {
  Semester.findById(id)
    .populate({
      path: "subjects",
      select: "-__v -createdAt -updatedAt",
    //   populate: { path: "lessons", select: "-__v" },
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
      semester._doc.createdAt = undefined;
      semester._doc.updatedAt = undefined;
      req.semester = semester._doc;
      next();
    });
};

exports.getSemester = (req, res) => {
  req.semester.__v = undefined;
  return res.json(req.semester);
};

exports.getAllSemestersByDepartment = (req,res) => {
  Semester.find({department:req.params.departmentId}).populate({
    path: "subjects",
    select: "-__v -createdAt -updatedAt",
  //   populate: { path: "lessons", select: "-__v" },
  })
  .populate(
    {
      path:"department",
      select: "-__v -createdAt -updatedAt -semesters ",
    },
  ).exec((err,semesters)=>{
      if (err || !semesters) {
          console.log(err);
          res.status(400).json({
              error: "An error occurred while trying to find all semesters from db " + err,
          });
      }else{
          return res.json(semesters.map(semester=>{
              semester.__v = undefined
              semester.createdAt = undefined
              semester.updatedAt = undefined
              console.log(semester)
              return semester
          }));
      }
  })
}

exports.createSemester = (req, res) => {
  const semester = new Semester(req.body);
  semester.save((err, semester) => {
    if (err || !semester) {
      console.log(err);
      res.status(400).json({
        error: "Not able to save semester in DB",
      });
    } else {
      Department.updateOne(
        { _id: semester.department },
        { $push: { semesters: semester._id } },
        (err, op) => {
          if (err || op.modifiedCount == 0) {
            console.log(err);
            res.status(400).json({
              error: "Not able to save semester in Department",
            });
          } else {
            semester.__v = undefined;
            res.json(semester);
          }
        }
      );
    }
  });
};

exports.updateSemester = (req, res) => {
  Semester.findByIdAndUpdate(
    { _id: req.semester._id },
    { $set: req.body },
    { new: true },
    (err, semester) => {
      if (err || !semester) {
        return res.status(400).json({
          error: "Update failed",
        });
      }
      semester.__v = undefined;
      return res.json(semester);
    }
  );
};

exports.deleteSemester = (req, res) => {
  Semester.deleteOne({ _id: req.semester._id }, (err, removedSemester) => {
    if (err || removedSemester.deletedCount == 0) {
      return res.status(400).json({
        error: "Failed to delete Semester",
      });
    }
    Department.updateOne(
      { _id: req.semester.department },
      { $pull: { semesters: req.semester._id } },
      (err, op) => {
        if (err || op.modifiedCount == 0) {
          console.log(err);
          res.status(400).json({
            error: "Failed to delete Semester from Department",
          });
        } else {
          res.json({
            message: `${req.semester.name} Semester Deleted Successfully`,
          });
        }
      }
    );
  });
};
