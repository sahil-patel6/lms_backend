const Notice = require("../models/notice");
const { removeFile } = require("../utilities/remove_file");

exports.getNoticeById = (req, res, next, id) => {
  Notice.findById(id)
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
  Notice.find({ semester: req.params.semesterId })
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
  // if (req?.file?.files) {
  //   req.body.files = [];
  //   if (Array.isArray(req.file.files)) {
  //     req.file.files.forEach((f) => {
  //       req.body.files.push(`/uploads/notices/${f.newFilename}`);
  //     });
  //   } else {
  //     req.body.files.push(`/uploads/notices/${req.file.files.newFilename}`);
  //   }
  // } else {
  //   req.body.files = [];
  // }
  const notice = new Notice(req.body);
  notice.save((err, notice) => {
    if (err || !notice) {
      console.log(err);
      /// REMOVING FILES IF IT EXISTS BECAUSE OF ERROR
      // req.body.files.forEach(file=>{
      //     removeFile(file);
      // })
      req.body.files.forEach((file) => {
        removeFile(file.fcs_path);
      });
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
  // if (req?.file?.files) {
  //   req.body.files = [];
  //   /// HERE WE CHECK IF NOTICE HAS FILES AND IF IT DOES THEN WE REMOVE THEM FROM FILE SYSTEM
  //   if (req.notice.files) {
  //     req.notice.files.forEach((file) => {
  //       removeFile(file);
  //     });
  //   }
  //   if (Array.isArray(req.file.files)) {
  //     req.file.files.forEach((f) => {
  //       req.body.files.push(`/uploads/notices/${f.newFilename}`);
  //     });
  //   } else {
  //     req.body.files.push(`/uploads/notices/${req.file.files.newFilename}`);
  //   }
  // }
  Notice.findOneAndUpdate(
    { _id: req.notice._id },
    { $set: req.body },
    { new: true }
  )
    .select("-createdAt -updatedAt -__v")
    .exec((err, notice) => {
      if (err || !notice) {
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
