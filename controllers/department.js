const Department = require("../models/department")

exports.getDepartmentById = (req, res, next, id) => {
    Department.findById(id)
            .populate({
                path:'semesters',
                populate:{
                    path:"subjects",
                    select:"-__v -createdAt -updatedAt -semester -department",
                    populate: {
                        path: "resources",
                        select: "-__v -createdAt -updatedAt"
                    }
                },
                select:'-__v -createdAt -updatedAt -department'
            }).exec((err, department) => {
        if (err || !department) {
            return res.status(400).json({
                error: "No department Found",
            });
        }
        req.department = department._doc;
        next();
    });
};


exports.getDepartment = (req, res) => {
    req.department.createdAt = undefined;
    req.department.updatedAt = undefined;
    req.department.__v = undefined;
    return res.json(req.department);
};

exports.getAllDepartments = (req,res) => {
    Department.find()
        .populate({
            path:'semesters',
            populate:{
                path:"subjects",
                select:"-__v -createdAt -updatedAt -semester -department",
                populate: {
                    path: "resources assignments",
                    select: "-__v -createdAt -updatedAt"
                }
            },
            select:'-__v -createdAt -updatedAt'
        }).select("-createdAt -updatedAt -__v")
        .exec((err,departments)=>{
        if (err || !departments) {
            console.log(err);
            return res.status(400).json({
                error: "An error occurred while trying to find all department from db " + err,
            });
        }else{
            return res.json({departments});
        }
    })
}

exports.createDepartment = (req,res) => {
    const department =  new Department(req.body);
    department.save((err, department) => {
        if (err || !department) {
            console.log(err);
            return res.status(400).json({
                error: "Not able to save department in DB",
            });
        } else {
            department.__v = undefined;
            department.createdAt = undefined;
            department.updatedAt = undefined;
            return res.json(department);
        }
    });
}

exports.updateDepartment = (req, res) => {
    Department.findOneAndUpdate(
        { _id: req.department._id },
        { $set: req.body },
        {new:true},
    ).select("-createdAt -updatedAt -__v").exec(
        (err, department) => {
            if (err || !department) {
                return res.status(400).json({
                    error: "Update failed",
                });
            }
            return res.json(department);
        }
    );
};

exports.deleteDepartment = (req, res) => {
    Department.deleteOne({_id: req.department._id},(err, removedDepartment) => {
        if (err || removedDepartment.deletedCount === 0) {
            return res.status(400).json({
                error: "Failed to delete Department",
            });
        }
        return res.json({
            message: `${req.department.name} Department Deleted Successfully`,
        });
    });
};