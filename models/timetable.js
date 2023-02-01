const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const timetableSchema = new Schema(
    {
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
        timetable: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

timetableSchema.pre("deleteOne", async function(next){
    const timetable = await this.model.findOne(this.getQuery())
    if (timetable){
        await preDeleteTimetable(timetable,next);
    }
    return next();
})
timetableSchema.pre("deleteMany",async function (next){
    const timetables = await this.model.find(this.getQuery())
    for (const timetable of timetables) {
        await preDeleteTimetable(timetable,next);
    }
    return next();
})

const preDeleteTimetable = async (timetable,next) =>{
    if (timetable.timetable){
        removeFile(timetable.timetable)
    }
}
module.exports = mongoose.model("TimeTable", timetableSchema);
