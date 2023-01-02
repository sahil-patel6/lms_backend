var mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = mongoose.Schema;

var Schema = mongoose.Schema;

var teacherSchema = new Schema(
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
            default: ""
        },
        bio: {
            type: String,
            trim: true,
            default: ""
        },
        address: {
            type: String,
            trim: true,
            default: ""
        },
        profile_pic: {
            type: String,
            trim: true,
            default: ""
        },
        device_id: {
            type: String,
            trim: true,
        },
        subjects: [{
            type: ObjectId,
            ref: "Subject",
            required: true,
        }],
        password: {
            type: String,
            required: true,
        },
        salt: String,
    },
    { timestamps: true }
);

teacherSchema
    .virtual("plainPassword")
    .set(function (password) {
        this._password = password;
        this.salt = uuidv4();
        this.password = this.securePassword(password);
    })
    .get(function () {
        return this._password;
    });

teacherSchema.methods = {
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
    updatePassword:  function  (plainPassword,cb)  {
        this.updateOne({password:this.securePassword(plainPassword)},cb);;
    }
};

module.exports = mongoose.model("Teacher", teacherSchema);
