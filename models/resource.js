const mongoose = require("mongoose");
const {removeFile} = require("../utilities/remove_file");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

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
                type: String,
            }],
            default: [],
        }
    },
    { timestamps: true }
);

resourceSchema.pre("save",async function(next){
    const Subject = require("./subject");
    try{
        await Subject.updateOne({ _id: this.subject }, { $push: { resources: this._id } })
    } catch (e){
        return next(e);
    }
    return next();
})

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
    const Subject = require("./subject")
    try{
        await Subject.updateOne({ _id: resource.subject }, { $pull: { resources: resource._id } });
    } catch (e) {
        return next(e)
    }
    resource.files.forEach((file)=>{
        removeFile(file);
    })
}

module.exports = mongoose.model("Resource", resourceSchema);
