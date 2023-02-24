const mongoose = require("mongoose");
const {removeFile} = require("../utilities/remove_file");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;
const fileSchema = require("./file_schema");

const resourceSchema = new Schema(
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
                type: fileSchema,
            }],
            default: [],
        }
    },
    { timestamps: true }
);

resourceSchema.pre("deleteOne",async function(next){
    const resource = await this.model.findOne(this.getQuery());
    await preDeleteResource(resource,next);
    return next()
})

resourceSchema.pre("deleteMany", async function(next){
    const resources = await this.model.find(this.getQuery());
    for (const resource of resources) {
        await preDeleteResource(resource,next);
    }
    return next();
})

const preDeleteResource = async (resource,next)=>{
    resource.files.forEach((file)=>{
        removeFile(file.fcs_path);
    })
}

module.exports = mongoose.model("Resource", resourceSchema);
