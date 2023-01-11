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
            default: ""
        },
        subject: {
            type: ObjectId,
            ref: "Subject",
            required: true,
        },
        files: {
            type: [{
                type: String,
            }],
            default: [],
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
