import User from "../models/User.js";
import { generateOTP, otpExpiry, optvalid } from "../utils/otp.js";
import { sendOTPEmail } from "../config/mailer.js";


//if you forgot in email or password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "No Account with this email" });

        user.otp = generateOTP();
        user.otpExpiry = otpExpiry();

        await user.save();

        await sendOTPEmail(user.email, user.otp, "Reset your Polify Password");
        res.json({ message: "Password reset link sent to your email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//to check the OTP is valid
export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "No Account with this email or User not found" });

        if (!optvalid(user, otp))
            return res.status(400).json({ message: "Invalid or expire OTP" });

        res.json({ message: "OTP is valid/ok" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


//to reset the password
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        if (!password || password.length < 8)
            return res.status(400).json({ message: "Password must be atleast 8 characters" });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "No Account with this email or User not found" });

        if (!optvalid(user, otp))
            return res.status(400).json({ message: "Invalid or expire OTP" });

        user.password = password;
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.isVerified = true;
        await user.save();
        res.json({ message: "Password reset successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
