const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const {unlink: removeFile} = require("fs");
const { ObjectId } = mongoose.Schema;

const Schema = mongoose.Schema;

const parentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    profile_pic: {
      type: String,
      trim: true,
      default: "",
    },
    device_id: {
      type: String,
      trim: true,
    },
    students: {
      type: [
        {
          type: ObjectId,
          ref: "Student",
        },
      ],
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: String,
  },
  { timestamps: true }
);

parentSchema
  .virtual("plainPassword")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv4();
    this.password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

parentSchema.methods = {
  securePassword: function (plainPassword) {
    if (!plainPassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainPassword)
        .digest("hex");
    } catch (error) {
      return "";
    }
  },
  authenticate: function (plainPassword) {
    return this.securePassword(plainPassword) === this.password;
  },
  updatePassword: function (plainPassword, cb) {
    this.updateOne({ password: this.securePassword(plainPassword) }, cb);
  },
};


parentSchema.pre("deleteOne", async function(next){
    const parent = await this.model.findOne(this.getQuery())
    if (parent.profile_pic){
        removeFile(`${__dirname}/../public${parent.profile_pic}`,(err)=>{
            if (err){
                console.log(err)
            }else{
                console.log("Successfully Deleted:",parent.profile_pic)
            }
        })
    }
    return next();
})
parentSchema.pre("deleteMany", async function (next){
    const parents = await this.model.find(this.getQuery())
    parents.forEach((parent)=>{
        if (parent.profile_pic){
            removeFile(`${__dirname}/../public${parent.profile_pic}`,(err)=>{
                if (err){
                    console.log(err)
                }else{
                    console.log("Successfully Deleted:",parent.profile_pic)
                }
            })
        }
    })
    return next();
})

module.exports = mongoose.model("Parent", parentSchema);
