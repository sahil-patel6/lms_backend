const Notice = require("../models/notice");
const { removeFile } = require("../utilities/remove_file");

exports.setNoticeUploadDir = (req, res, next) => {
  const fs = require("fs");
  const dir = `${__dirname}/../public/uploads/notices/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  req.uploadDir = dir;
  next();
};

exports.getNoticeById = (req, res, next, id) => {
  Notice.findById(id)
    .populate("semester", "_id name")
    .exec((err, notice) => {
      if (err || !notice) {
        return res.status(400).json({
          error: "No Notice Found",
        });
      }
      req.notice = notice._doc;
      next();
    });
};

exports.getNotice = (req, res) => {
  req.notice.__v = undefined;
  req.notice.createdAt = undefined;
  req.notice.updatedAt = undefined;
  return res.json(req.notice);
};

exports.getNoticeBySemester = (req, res) => {
  Notice.findOne({ semester: req.params.semesterId })
    .populate("semester", "_id name")
    .select("-createdAt -updatedAt -__v")
    .exec((err, notices) => {
      if (err || !notices) {
        console.log(err);
        return res.status(400).json({
          error: "Notices Not Found",
        });
      } else {
        return res.json(notices);
      }
    });
};

exports.createNotice = (req, res) => {
  if (req?.file?.files) {
    req.body.files = [];
    if (Array.isArray(req.file.files)) {
      req.file.files.forEach((f) => {
        req.body.files.push(`/uploads/notices/${f.newFilename}`);
      });
    } else {
      req.body.files.push(`/uploads/notices/${req.file.files.newFilename}`);
    }
  } else {
    req.body.files = [];
  }
  const notice = new Notice(req.body);
  notice.save((err, notice) => {
    if (err || !notice) {
      console.log(err);
      /// REMOVING FILES IF IT EXISTED BECAUSE OF ERROR
      req.body.files.forEach((file) => {
        removeFile(file);
      });
      return res.status(400).json({
        error: "Not able to save notice in DB",
      });
    } else {
      notice.__v = undefined;
      notice.createdAt = undefined;
      notice.updatedAt = undefined;
      return res.json(notice);
    }
  });
};

exports.updateNotice = (req, res) => {
  if (req?.file?.files) {
    req.body.files = [];
    /// HERE WE CHECK IF NOTICE HAS FILES AND IF IT DOES THEN WE REMOVE THEM FROM FILE SYSTEM
    if (req.notice.files) {
      req.notice.files.forEach((file) => {
        removeFile(file);
      });
    }
    if (Array.isArray(req.file.files)) {
      req.file.files.forEach((f) => {
        req.body.files.push(`/uploads/notices/${f.newFilename}`);
      });
    } else {
      req.body.files.push(`/uploads/notices/${req.file.files.newFilename}`);
    }
  }
  Notice.findOneAndUpdate(
    { _id: req.notice._id },
    { $set: req.body },
    { new: true }
  )
    .populate("semester", "_id name")
    .select("-createdAt -updatedAt -__v")
    .exec((err, notice) => {
      if (err || !notice) {
        console.log(err);
        return res.status(400).json({
          error: "Update failed",
        });
      }
      return res.json(notice);
    });
};

exports.deleteNotice = (req, res) => {
  Notice.deleteOne({ _id: req.notice._id }, (err, removedNotice) => {
    if (err || removedNotice.deletedCount === 0) {
      return res.status(400).json({
        error: "Failed to delete Notice",
      });
    }
    return res.json({
      message: "Notice Deleted Successfully",
    });
  });
};
