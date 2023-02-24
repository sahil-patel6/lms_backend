const mongoose = require("mongoose");
const { removeFile } = require("../utilities/remove_file");
const fileSchema = require("./file_schema");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const noticeSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        semester: {
            type: ObjectId,
            ref: "Semester",
            required: true,
        },
        type: {
            type: String,
            enum: ['Announcement','Timetable','Result']
        },
        date: {
            type:Date,
            default: Date.now(),
        },
        files: {
            type: [{
                type: fileSchema,
                required: true,
            }], default: [],
        }
    },
    { timestamps: true }
);

noticeSchema.pre("deleteOne", async function (next) {
    const notice = await this.model.findOne(this.getQuery())
    if (notice) {
        await preDeleteNotice(notice, next);
    }
    return next();
})
noticeSchema.pre("deleteMany", async function (next) {
    const notices = await this.model.find(this.getQuery())
    for (const notice of notices) {
        await preDeleteNotice(notice, next);
    }
    return next();
})

const preDeleteNotice = async (notice, next) => {
    notice.files.forEach((file)=>{
        removeFile(file.fcs_path);
    })
}
module.exports = mongoose.model("Notice", noticeSchema);
