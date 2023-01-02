var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

var lessonSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            maxlength: 32,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "This information has not been added yet"
        },
        semester: {
            type: ObjectId,
            ref: "Semester",
            required: true,
        },
        subject: {
            type: ObjectId,
            ref: "Subject",
            required: true,
        },
        department: {
            type: ObjectId,
            ref: "Department",
            required: true,
        },
        files: [{
            type: String,
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
