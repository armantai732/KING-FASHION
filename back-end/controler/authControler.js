import { User } from "../model/authModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { SendVerficationCode } from "../middleware/Email.js"

const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between OTP resends

export const Register = async (req, res) => {
    try {
        const { name, email, password, role, secretKey } = req.body

        const exitsUser = await User.findOne({ email })
        if (exitsUser) {
            return res.status(400).json({
                status: false,
                message: "User Already Register! first Login."
            })
        }

        const hashpassword = await bcrypt.hash(password, 10)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()


        if (role === "admin") {
            if (!secretKey || secretKey !== process.env.SECRET_KEY) {
                return res.status(400).json({
                    status: false,
                    message: "Secret key not valide"
                })
            }
        }

        const newUSer = await User.create({
            name, email, password: hashpassword, role, secretKey, verificationCode, verificationCodeLastSentAt: new Date()
        })


        // console.log("Sending OTP...");
        // try {
        //     await SendVerficationCode(newUSer.email, verificationCode);
        //     console.log("OTP Sent successfully");
        // } catch (emailErr) {
        //     console.log("OTP sending failed:", emailErr.message);
        // }



        res.status(201).json({
            status: true,
            message: "Register Succesfully!",
            data: newUSer,
            role: newUSer.role,
        })
        await SendVerficationCode(newUSer.email, verificationCode)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: false,
            message: error.message
        });

    }
}


export const verifyemail = async (req, res) => {
    try {
        const { email, otp } = req.body

        const user = await User.findOne({ email, verificationCode: otp })

        if (!user) {
            return res.status(500).json({
                status: false,
                message: "Invalid or Expired Code"
            })
        }

        user.isVerified = true
        user.verificationCode = undefined
        await user.save()

        return res.status(202).json({
            status: true,
            message: "Email Verifed Succesfully"
        })

    } catch (error) {
        console.log(error)
    }
}

// Resend the email-verification OTP for an account that registered but
// never verified. Used both by the "Resend OTP" button on the verify screen
// and automatically when someone tries to log in before verifying.
export const ResendVerificationOtp = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ status: false, message: "Email is required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ status: false, message: "User Register First" })
        }

        if (user.isVerified) {
            return res.status(400).json({ status: false, message: "This account is already verified. Please login." })
        }

        if (
            user.verificationCodeLastSentAt &&
            Date.now() - user.verificationCodeLastSentAt.getTime() < RESEND_COOLDOWN_MS
        ) {
            const wait = Math.ceil(
                (RESEND_COOLDOWN_MS - (Date.now() - user.verificationCodeLastSentAt.getTime())) / 1000
            );
            return res.status(429).json({
                status: false,
                message: `Please wait ${wait}s before requesting another OTP.`,
            });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        user.verificationCode = verificationCode
        user.verificationCodeLastSentAt = new Date()
        await user.save()

        await SendVerficationCode(user.email, verificationCode)

        return res.status(200).json({
            status: true,
            message: "OTP sent to your email",
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body

        const exitsUser = await User.findOne({ email })
        if (!exitsUser) {
            return res.status(404).json({
                status: false,
                message: "User Register First"
            })
        }

        const isMatch = await bcrypt.compare(password, exitsUser.password)

        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: "Invalid password"
            })
        }

        if (!exitsUser.isVerified) {
            return res.status(400).json({
                status: false,
                message: "Please verify your email first.",
                needsVerification: true,
            });
        }

        const token = jwt.sign({ id: exitsUser.id, email: exitsUser.email, role: exitsUser.role }, process.env.JSON_WEB_TOKEN, { expiresIn: "7d" })

        return res.status(200).json({
            status: true,
            message: "Login Succesfully!",
            token: token,
            role: exitsUser.role,
        })

    } catch (error) {
        console.log(error.message)
    }
}