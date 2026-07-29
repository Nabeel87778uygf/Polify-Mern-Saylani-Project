import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { generateOTP, optvalid } from "../utils/otp.js";
import { otpExpiry } from "../utils/otp.js";
import { sendOTPEmail } from "../config/mailer.js";
import jwt from "jsonwebtoken";

const makeToken = (id) => { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" }) };

const clean = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,

    }
}

//to register a user and send otp to that email

export const register = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        // Check required fields
        if (!name || !email || !username || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        // Check if email or username already exists
        const userExists = await User.findOne({
            $or: [{ email }, { username }],
        });


        if (userExists) {
            return res.status(400).json({
                message: "Email or Username already exists",
            });
        }

        // Upload avatar (optional)
        let avatar = "";

        if (req.file) {
            try {
                avatar = await uploadToCloudinary(req.file.buffer);
            } catch (error) {
                return res.status(500).json({
                    message: "Failed to upload image",
                });
            }
        }

        // Generate OTP
        const otp = generateOTP();

        // Create user
        const user = await User.create({
            name,
            email,
            username,
            password,
            avatar,
            otp,
            otpExpiry: otpExpiry(),
        });

        // Send OTP Email
        await sendOTPEmail(
            user.email,
            otp,
            "verify your Pollify account"
        );

        return res.status(201).json({
            needVerification: true,
            email: user.email,
            message: "Verification code has been sent to your email.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

//to verify the user with the otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!optvalid(user, otp)) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        //to mark as verified and clear otp
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        //to generate token
        res.json({
            token: makeToken(user._id),
            user: clean(user), //to exlcude the password field
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//to resend otp
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        //to generate  otp
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = otpExpiry();
        await user.save();
        //to send  otp
        await sendOTPEmail(user.email, user.otp, "verify your polify account");
        res.status(200).json({ message: "OTP Sent" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


//login a  user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: "Invalid email or password" });

        if (!user.isVerified)
            return res.status(403).json({ message: "Email is not verified. Please verify your email." });

        //to generate token
        res.json({
            token: makeToken(user._id),
            user: clean(user),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//update profile
export const updateProfile = async (req, res) => {
    try {
        const { name, username, bio } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username && username !== user.username) {
            const taken = await User.findOne({ username });
            if (taken) return res.status(400).json({ message: "Username already taken" });
            user.username = username;
        }
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (req.file) {
            try { user.avatar = await uploadToCloudinary(req.file.buffer); }
            catch (e) { console.warn("Avatar upload skipped:", e.message); }
        } //to upload a new image and save it to cloudinary
        await user.save();  //updated user
        res.json({ user: clean(user) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//to change password 
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 8)
            return res.status(400).json({
                message: "New Password must be at least 8 characters"
            });

        const user = await User.findById(req.userId);

        if (!user)
            return res.status(404).json({ message: "User not found" });

        //current password verify
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid current password" });

        //new password 
        user.password = newPassword;

        await user.save();

        res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


//to delete an account
export const deleteAccount = async (req, res) => {
    try {
        const id = req.userId;
                const mypolls = await Poll.find({ $or: [{ creator: id }, { creater: id }] }).select("_id");
        const pollsIds = mypolls.map((p) => p._id);

        await Comment.deleteMany({ $or: [{ user: id }, { poll: { $in: pollsIds } }] })

        await Poll.deleteMany({ $or: [{ creator: id }, { creater: id }] });

        await Poll.updateMany({}, { $pull: { votes: { user: id } } });

        await User.findByIdAndDelete(id);


        res.clearCookie("token");
        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//to get logged in user profiles
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const [created, voted] = await Promise.all([
            Poll.countDocuments({ $or: [{ creator: user._id }, { creater: user._id }] }),
            Poll.countDocuments({ "votes.user": user._id })
        ])

        res.json({
            user: clean(user),
            stats: {
                created,
                voted,
                bookmarked: user.bookmarks.length
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}