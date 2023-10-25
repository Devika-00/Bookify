const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const {roles} = require("../utils/constants");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
    firstName :{
        type : String,
        required:true,
    },
    lastName:{
        type: String,
        required:true,
    },
    email:{
        type: String,
        required:true,
        unique:true,
    },
    image: {
        type: String,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    mobile: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: [roles.user, roles.admin, roles.superAdmin],
        default: roles.user,
    },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetTokenExpires: Date,
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        updatedAt: {
            type: Date,
            default: Date.now(),
        },
        refferalId: {
            type:String,
            unique:true,
        },
        refferedBy:{
            type:String,
        },
    },
    { timestamps: true }
);

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
    if (this.email === process.env.ADMIN_EMAIL.toLowerCase()) {
        this.role = roles.superAdmin;
    }
    next();
});

UserSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.createResetPasswordToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

UserSchema.pre("save",function(next){
    if(this.isNew){
        const randomToken = crypto.randomBytes(2).toString("hex");
        const last4Digits = this._id.toString().slice(-4);
        this.refferalId = "BK" + last4Digits + randomToken;
    }
    next();
})


module.exports = mongoose.model("User", UserSchema);