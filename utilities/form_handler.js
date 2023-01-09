const formidable = require("formidable");

exports.handleForm = (req, res,next) => {
  let form = new formidable.IncomingForm({
    keepExtensions: true,
    maxFileSize: 3 * 1024 * 1024,
    uploadDir: req.uploadDir,
    filter: function ({ name, originalFilename, mimetype }) {
      // keep only images
      req.isImage = mimetype && mimetype.includes("image");
      return req.isImage;
    },
    filename: function (name, ext, part, form) {
      return `${Date.now()}${ext}`;
    },
  });
  form.parse(req, (err, fields, file) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: "Please upload only one image file ",
      });
    }
    try{
      if(fields?.students){
        fields.students = JSON.parse(fields.students);
      }
    } catch (e){
      return res.status(400).json({
        error: "An error occurred: "+ e
      })
    }
    req.body = fields;
    req.file = file;
    next();
  });
};
