const Resource = require("../models/resource");
const { removeFile } = require("../utilities/remove_file");

exports.getResourceById = (req, res, next, id) => {
  Resource.findById(id).exec((err, resource) => {
    if (err || !resource) {
      return res.status(400).json({
        error: "No Resource Found",
      });
    }
    req.resource = resource._doc;
    next();
  });
};

exports.getResource = (req, res) => {
  req.resource.__v = undefined;
  req.resource.createdAt = undefined;
  req.resource.updatedAt = undefined;
  return res.json(req.resource);
};

exports.getAllResourcesBySubject = (req, res) => {
  Resource.find({ subject: req.params.subjectId })
    .select("-createdAt -updatedAt -__v")
    .exec((err, resources) => {
      if (err || !resources) {
        console.log(err);
        return res.status(400).json({
          error:
            "An error occurred while trying to find all resources from db " +
            err,
        });
      } else {
        return res.json(resources);
      }
    });
};

exports.createResource = (req, res, next) => {
  // if (req?.file?.files){
  //     req.body.files = []
  //     req.file.files.forEach((f)=>{
  //         req.body.files.push(`/uploads/resources/${f.newFilename}`)
  //     })
  // }else{
  //     req.body.files = [];
  // }
  const resource = new Resource(req.body);
  resource.save((err, resource) => {
    if (err || !resource) {
      console.log(err);
      /// REMOVING FILES IF IT EXISTS BECAUSE OF ERROR
      // req.body.files.forEach(file=>{
      //     removeFile(file);
      // })
      req.body.files.forEach((file) => {
        removeFile(file.fcs_path);
      });
      /// THIS CODE MEANS THERE IS A DUPLICATE KEY
      if (err.code === 11000) {
        const key = Object.keys(err.keyValue);
        const value = Object.values(err.keyValue);
        console.log(Object.keys(err.keyValue));
        console.log(Object.values(err.keyValue));
        return res.status(400).json({
          error: `${key[0]} already exists`,
        });
      }
      return res.status(400).json({
        error: "Not able to save resource in DB",
      });
    } else {
      resource.__v = undefined;
      resource.createdAt = undefined;
      resource.updatedAt = undefined;
      return res.json(resource);
    }
  });
};

exports.updateResource = (req, res) => {
  // if(req?.file?.files){
  //     /// HERE WE CHECK IF RESOURCE HAS FILES AND IF IT DOES THEN WE REMOVE THEM FROM FILE SYSTEM
  //     if (req.resource.files){
  //         req.resource.files.forEach(file=>{
  //             removeFile(file)
  //         })
  //     }
  //     req.body.files = []
  //     req.file.files.forEach((f)=>{
  //         req.body.files.push(`/uploads/resources/${f.newFilename}`)
  //     })
  // }
  Resource.findOneAndUpdate(
    { _id: req.resource._id },
    { $set: req.body },
    { new: true }
  )
    .select("-createdAt -updatedAt -__v")
    .exec((err, resource) => {
      if (err || !resource) {
        console.log(err);
        /// THIS CODE MEANS THERE IS A DUPLICATE KEY
        if (err.code === 11000) {
          const key = Object.keys(err.keyValue);
          const value = Object.values(err.keyValue);
          console.log(Object.keys(err.keyValue));
          console.log(Object.values(err.keyValue));
          return res.status(400).json({
            error: `${key[0]} already exists`,
          });
        }
        return res.status(400).json({
          error: "Update failed",
        });
      }
      return res.json(resource);
    });
};

exports.deleteResource = (req, res) => {
  /// DELETING RESOURCE
  Resource.deleteOne({ _id: req.resource._id }, (err, removedResource) => {
    if (err || removedResource.deletedCount === 0) {
      return res.status(400).json({
        error: "Failed to delete Resource",
      });
    }
    return res.json({
      message: `${req.resource.title} Resource Deleted Successfully`,
    });
  });
};
