const Department = require("../models/department");
const mongoose = require("mongoose");
const { departmentAggregationHelper } = require("../utilities/aggregation_helpers");
const ObjectId = mongoose.Types.ObjectId;
exports.getDepartmentById = (req, res, next, id) => {
  Department.aggregate([
    {
      $match: {
        _id: ObjectId(id),
      },
    },
    ...departmentAggregationHelper,
  ]).exec((err, department) => {
    if (err || !department || department.length === 0) {
      return res.status(400).json({
        error: "No department Found",
      });
    }
    req.department = department[0];
    next();
  });
};

exports.getDepartment = (req, res) => {
  return res.json(req.department);
};

exports.getAllDepartments = (req, res) => {
  Department.aggregate(departmentAggregationHelper).exec((err, departments) => {
    if (err || !departments) {
      console.log(err);
      return res.status(400).json({
        error:
          "An error occurred while trying to find all department from db " +
          err,
      });
    } else {
      return res.json(departments);
    }
  });
};

exports.createDepartment = (req, res) => {
  const department = new Department(req.body);
  department.save((err, department) => {
    if (err || !department) {
      console.log(err);
      /// THIS CODE MEANS THERE IS A DUPLICATE KEY
      if (err.code === 11000){
        const key = Object.keys(err.keyValue);
        const value = Object.values(err.keyValue);
        console.log(Object.keys(err.keyValue))
        console.log(Object.values(err.keyValue))
        return res.status(400).json({
          error: `${key[0]} already exists`
        })
      }
      return res.status(400).json({
        error: "Not able to save department in DB",
      });
    } else {
      department.__v = undefined;
      department.createdAt = undefined;
      department.updatedAt = undefined;
      return res.json(department);
    }
  });
};

exports.updateDepartment = (req, res) => {
  Department.findOneAndUpdate(
    { _id: req.department._id },
    { $set: req.body },
    { new: true }
  )
    .select("-createdAt -updatedAt -__v")
    .exec((err, department) => {
      if (err || !department) {
        console.log(err);
        /// THIS CODE MEANS THERE IS A DUPLICATE KEY
        if (err.code === 11000){
          const key = Object.keys(err.keyValue);
          const value = Object.values(err.keyValue);
          console.log(Object.keys(err.keyValue))
          console.log(Object.values(err.keyValue))
          return res.status(400).json({
            error: `${key[0]} already exists`
          })
        }
        return res.status(400).json({
          error: "Update failed",
        });
      }
      return res.json(department);
    });
};

exports.deleteDepartment = (req, res) => {
  Department.deleteOne(
    { _id: req.department._id },
    (err, removedDepartment) => {
      if (err || removedDepartment.deletedCount === 0) {
        console.log(err);
        return res.status(400).json({
          error: "Failed to delete Department",
        });
      }
      return res.json({
        message: `${req.department.name} Department Deleted Successfully`,
      });
    }
  );
};
