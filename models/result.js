const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const resultSchema = new Schema(
    {
        result_name :{
            type:String,
            required: true,
        },
        result: {
            type:String,
            required: true,
        },
        department: {
            type: ObjectId,
            ref: "Department",
            required: true,
        },
        semester: {
            type: ObjectId,
            ref: "Semester",
            required: true,
        },
    },
    { timestamps: true }
);


resultSchema.pre("deleteOne", async function(next){
    const result = await this.model.findOne(this.getQuery())
    if (result){
        await preDeleteResult(result,next);
    }
    return next();
})
resultSchema.pre("deleteMany",async function (next){
    const results = await this.model.find(this.getQuery())
    for (const result of results) {
        await preDeleteResult(result,next);
    }
    return next();
})

const preDeleteResult = async (result,next) =>{
    if (result.result){
        removeFile(result.result)
    }
}

module.exports = mongoose.model("Result", resultSchema);
