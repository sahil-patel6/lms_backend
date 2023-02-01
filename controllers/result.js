const Result = require("../models/result");
const Department = require("../models/department");
const { removeFile } = require("../utilities/remove_file");

exports.setResultUploadDir = (req, res, next) => {
  const fs = require("fs");
  const dir = `${__dirname}/../public/uploads/results/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  req.uploadDir = dir;
  next();
};

exports.getResultById = (req, res, next, id) => {
  Result.findById(id)
    .populate("semester", "_id name")
    .populate("department", "_id name")
    .exec((err, result) => {
      if (err || !result) {
        return res.status(400).json({
          error: "No result Found",
        });
      }
      req.result = result._doc;
      next();
    });
};

exports.getResult = (req, res) => {
  req.result.__v = undefined;
  req.result.createdAt = undefined;
  req.result.updatedAt = undefined;
  return res.json(req.result);
};

exports.getResultBySemester = (req, res) => {
  Result.findOne({ semester: req.params.semesterId })
    .populate("semester", "_id name")
    .populate("department", "_id name")
    .select("-createdAt -updatedAt -__v")
    .exec((err, result) => {
      if (err || !result) {
        console.log(err);
        return res.status(400).json({
          error:
            "An error occurred while trying to find all result from db " + err,
        });
      } else {
        return res.json({ result });
      }
    });
};

exports.createResult = (req, res, next) => {
  if (req?.file?.result) {
    console.log(req.file.result.filepath, req.file.result.newFilename);
    req.body.result = `/uploads/results/${req.file.result.newFilename}`;
  } else {
    req.body.result = "";
  }
  const result = new Result(req.body);
  result.save((err, result) => {
    if (err || !result) {
      console.log(err);
      /// REMOVING RESULT PIC URL IF IT EXISTS BECAUSE OF ERROR
      if (req.body.result) {
        removeFile(req.body.result);
      }
      return res.status(400).json({
        error: "Not able to save result in DB",
      });
    } else {
      result.__v = undefined;
      result.createdAt = undefined;
      result.updatedAt = undefined;
      return res.json(result);
    }
  });
};

exports.updateResult = (req, res) => {
  if (req?.file?.result) {
    /// HERE WE CHECK IF RESULT HAS result AND IF IT DOES THEN WE REMOVE PIC FROM FILE SYSTEM
    if (req.result.result) {
      removeFile(req.result.result);
    }
    console.log(req.file?.result?.filepath, req.file?.result?.newFilename);
    req.body.result = `/uploads/results/${req.file.result.newFilename}`;
  }
  Result
    .findOneAndUpdate(
      { _id: req.result._id },
      { $set: req.body },
      { new: true }
    )
    .select("-createdAt -updatedAt -__v")
    .exec((err, result) => {
      if (err || !result) {
        return res.status(400).json({
          error: "Update failed",
        });
      }
      return res.json(result);
    });
};

exports.deleteResult = (req, res) => {
  Result.deleteOne({ _id: req.result._id }, (err, removedresult) => {
    if (err || removedresult.deletedCount === 0) {
      return res.status(400).json({
        error: "Failed to delete result",
      });
    }
    return res.json({
      message: "result Deleted Successfully",
    });
  });
};
