import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    secretKey: {
        type: String
    },
    isVerified: {
        type:Boolean,
        default: false
    },
    verificationCode:String,
    verificationCodeLastSentAt: Date,

    // forgot-password OTP fields (mirrors delivery-otp pattern)
    resetPasswordOtpHash: {
        type: String,
        select: false,
    },
    resetPasswordOtpExpires: Date,
    resetPasswordAttempts: {
        type: Number,
        default: 0,
    },
    resetPasswordLastSentAt: Date,

    // permanent wishlist — stays until the user unlikes a product
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],

    savedAddress: {
        fullName: String,
        phone: String,
        addressLine: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
    }
}, { timestamps: true })

export const User = mongoose.model("User", userSchema)