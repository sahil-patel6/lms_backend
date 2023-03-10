const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid');

const Schema = mongoose.Schema;

const adminSchema = new Schema(
    {
        name: {
            type:String,
            trim: true,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,

        },
        salt: String,
    },
    { timestamps: true }
);

adminSchema
    .virtual("plainPassword")
    .set(function (password) {
        this._password = password;
        this.salt = uuidv4();
        this.password = this.securePassword(password);
    })
    .get(function () {
        return this._password;
    });

adminSchema.methods = {
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
        this.updateOne({password:this.securePassword(plainPassword)},cb);
    }
};

module.exports = mongoose.model("admin", adminSchema);
