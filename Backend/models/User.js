import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    avatar: {
        type: String,        // Cloudinary URL
        default: ''
    },
    bio: {
        type: String,
        default: "",
        // minlength: 160

    },
    bookmarks: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Poll"
        }],
        default: []
    },

    following: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        default: []
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpiry: Date

}, { timestamps: true });

//to hash the password before saving the user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);

});

// to compare the user password with the saved password 
userSchema.methods.matchPassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);