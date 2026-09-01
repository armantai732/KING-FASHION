import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../model/authModel.js";
import { SendPasswordResetOtpEmail } from "../middleware/Email.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between OTP requests
const MAX_VERIFY_ATTEMPTS = 5; // wrong guesses allowed per OTP

// STEP 1 — request an OTP to reset the password for a given email
export const RequestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: false, message: "No account found with this email." });
        }

        if (
            user.resetPasswordLastSentAt &&
            Date.now() - user.resetPasswordLastSentAt.getTime() < RESEND_COOLDOWN_MS
        ) {
            const wait = Math.ceil(
                (RESEND_COOLDOWN_MS - (Date.now() - user.resetPasswordLastSentAt.getTime())) / 1000
            );
            return res.status(429).json({
                status: false,
                message: `Please wait ${wait}s before requesting another OTP.`,
            });
        }

        // cryptographically-random 6-digit code, not Math.random()
        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        user.resetPasswordOtpHash = otpHash;
        user.resetPasswordOtpExpires = new Date(Date.now() + OTP_TTL_MS);
        user.resetPasswordAttempts = 0;
        user.resetPasswordLastSentAt = new Date();
        await user.save();

        await SendPasswordResetOtpEmail(user.email, otp);

        return res.status(200).json({
            status: true,
            message: "OTP sent to your email. It is valid for 10 minutes.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while sending the OTP",
        });
    }
};

// STEP 2 — verify the OTP and set the new password in one go
export const ResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                status: false,
                message: "Email, OTP and new password are required",
            });
        }

        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({ status: false, message: "Enter the 6-digit OTP" });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({
                status: false,
                message: "Password must be at least 6 characters long",
            });
        }

        const user = await User.findOne({ email }).select("+resetPasswordOtpHash");
        if (!user) {
            return res.status(404).json({ status: false, message: "No account found with this email." });
        }

        if (!user.resetPasswordOtpHash || !user.resetPasswordOtpExpires) {
            return res.status(400).json({
                status: false,
                message: "No OTP was requested for this account. Please request one first.",
            });
        }

        if (user.resetPasswordOtpExpires.getTime() < Date.now()) {
            user.resetPasswordOtpHash = undefined;
            user.resetPasswordOtpExpires = undefined;
            await user.save();
            return res.status(400).json({
                status: false,
                message: "This OTP has expired. Please request a new one.",
            });
        }

        if (user.resetPasswordAttempts >= MAX_VERIFY_ATTEMPTS) {
            user.resetPasswordOtpHash = undefined;
            user.resetPasswordOtpExpires = undefined;
            await user.save();
            return res.status(429).json({
                status: false,
                message: "Too many incorrect attempts. Please request a new OTP.",
            });
        }

        const isMatch = await bcrypt.compare(String(otp), user.resetPasswordOtpHash);

        if (!isMatch) {
            user.resetPasswordAttempts += 1;
            await user.save();
            const remaining = MAX_VERIFY_ATTEMPTS - user.resetPasswordAttempts;
            return res.status(400).json({
                status: false,
                message:
                    remaining > 0
                        ? `Incorrect OTP. ${remaining} attempt(s) remaining.`
                        : "Incorrect OTP. Please request a new one.",
            });
        }

        // success — hash the new password with bcrypt and store it, clear OTP fields
        user.password = await bcrypt.hash(String(newPassword), 10);
        user.resetPasswordOtpHash = undefined;
        user.resetPasswordOtpExpires = undefined;
        user.resetPasswordAttempts = 0;
        await user.save();

        return res.status(200).json({
            status: true,
            message: "Password reset successfully! You can now login with your new password.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while resetting the password",
        });
    }
};
