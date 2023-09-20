const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const {roles} = require("../utils/constants");

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
    isEmailVerified: {
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

});

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


module.exports = mongoose.model("User", UserSchema);