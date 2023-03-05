const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  name_of_file:{
    type: String,
    required: true,
  },
  download_url: {
    type: String,
    required: true,
  },
  fcs_path:{
    type: String,
    required:true,
  },
  type_of_file: {
    type: String,
    required: true,
  },
  size_of_file: {
    type: Number,
    required: true,
  }
});

module.exports = fileSchema;
