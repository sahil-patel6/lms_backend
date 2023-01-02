const Department = require("../models/department")

exports.getDepartmentById = (req, res, next, id) => {
    Department.findById(id)
            .populate({path:'semesters',populate:{path:"subjects",select:"-__v -createdAt -updatedAt"},select:'-__v -createdAt -updatedAt'})
            .exec((err, department) => {
        if (err || !department) {
            return res.status(400).json({
                error: "No department Found",
            });
        }
        department._doc.createdAt = undefined;
        department._doc.updatedAt = undefined;
        req.department = department._doc;
        next();
    });
};


exports.getDepartment = (req, res) => {
    req.department.__v = undefined;
    return res.json(req.department);
};

exports.getAllDepartments = (req,res) => {
    Department.find()
    .populate({path:'semesters',populate:{path:"subjects",select:"-__v -createdAt -updatedAt"},select:'-__v -createdAt -updatedAt'})
    .exec((err,departments)=>{
        if (err || !departments) {
            console.log(err);
            res.status(400).json({
                error: "An error occurred while trying to find all department from db " + err,
            });
        }else{
            return res.json(departments.map(department=>{
                department.createdAt = undefined;
                department.updatedAt = undefined;
                department.__v = undefined
                return department
            }));
        }
    })
}

exports.createDepartment = (req,res) => {
    const department =  new Department(req.body);
    department.save((err, department) => {
        if (err || !department) {
            console.log(err);
            res.status(400).json({
                error: "Not able to save department in DB",
            });
        } else {            
            department.__v = undefined;
            res.json(department);
        }
    });
}

exports.updateDepartment = (req, res) => {
    Department.findByIdAndUpdate(
        { _id: req.department._id },
        { $set: req.body },
        {new:true},
        (err, department) => {
            if (err || !department) {
                return res.status(400).json({
                    error: "Update failed",
                });
            }
            department.__v = undefined;
            return res.json(department);
        }
    );
};

exports.deleteDepartment = (req, res) => {
    Department.deleteOne({_id: req.department._id},(err, removedDepartment) => {
        console.log(removedDepartment);
        if (err || removedDepartment.deletedCount == 0) {
            return res.status(400).json({
                error: "Failed to delete Department",
            });
        }
        res.json({
            message: `${req.department.name} Department Deleted Successfully`,
        });
    });
};