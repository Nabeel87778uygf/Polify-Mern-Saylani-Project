import express from "express";
import { upload } from "../config/cloudinary.js";
import { register } from "../controllers/authController.js";
import { forgotPassword, verifyResetOtp, resetPassword } from "../controllers/passwordController.js";
import { verifyOtp } from "../controllers/authController.js";
import { resendOTP } from "../controllers/authController.js";
import { login } from "../controllers/authController.js";
import { updateProfile } from "../controllers/authController.js";
import { changePassword } from "../controllers/authController.js";
import { getMe } from "../controllers/authController.js";
import { deleteAccount } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/register", upload.single("image"), register);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/resend-otp", resendOTP);

authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-reset-otp", verifyResetOtp);


authRouter.post("/reset-password", resetPassword);

//protected Routes
authRouter.get("/me", protect, getMe);

authRouter.patch("/profile", protect, upload.single("image"), updateProfile);

authRouter.patch("/password", protect, changePassword);

authRouter.delete("/account", protect, deleteAccount);

export default authRouter;
