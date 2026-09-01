import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Order } from "../model/Order.js";
import { User } from "../model/authModel.js";
import { SendDeliveryOtpEmail, SendDeliveryConfirmedEmail } from "../middleware/Email.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between OTP requests
const MAX_VERIFY_ATTEMPTS = 5; // wrong guesses allowed per OTP

// Generic message used for every "this order/email combo isn't valid" case.
// Keeping it identical for "no such order" vs "wrong email" vs "wrong status"
// stops someone from using this endpoint to probe which order ids exist.
const GENERIC_INVALID = "We couldn't verify those details. Please check your Order ID and email and try again.";

// very small in-memory throttle, keyed by IP, so a script can't hammer this
// public endpoint with random order ids / emails. Fine for a single-instance
// deployment; swap for a Redis-backed limiter if you ever run multiple instances.
const requestHits = new Map(); // ip -> [timestamps]
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_HITS = 8;

const isRateLimited = (ip) => {
    const now = Date.now();
    const hits = (requestHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    hits.push(now);
    requestHits.set(ip, hits);
    return hits.length > RATE_LIMIT_MAX_HITS;
};

const findMatchingOrder = async (orderId, email) => {
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) return null;
    if (!email || typeof email !== "string") return null;

    const order = await Order.findById(orderId)
        .select("+deliveryOtpHash")
        .populate("user", "email name");

    if (!order || !order.user?.email) return null;
    if (order.user.email.toLowerCase() !== email.trim().toLowerCase()) return null;

    return order;
};

// STEP 1 — request an OTP for a given order + email
export const RequestDeliveryOtp = async (req, res) => {
    try {
        const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
        if (isRateLimited(ip)) {
            return res.status(429).json({
                status: false,
                message: "Too many requests. Please try again in a minute.",
            });
        }

        const { orderId, email } = req.body;
        const order = await findMatchingOrder(orderId, email);

        if (!order) {
            return res.status(404).json({ status: false, message: GENERIC_INVALID });
        }

        if (order.status !== "Shipping") {
            return res.status(400).json({
                status: false,
                message:
                    order.status === "Delivered"
                        ? "This order has already been marked as delivered."
                        : "This order isn't out for delivery yet, so it can't be confirmed.",
            });
        }

        if (
            order.deliveryOtpLastSentAt &&
            Date.now() - order.deliveryOtpLastSentAt.getTime() < RESEND_COOLDOWN_MS
        ) {
            const wait = Math.ceil(
                (RESEND_COOLDOWN_MS - (Date.now() - order.deliveryOtpLastSentAt.getTime())) / 1000
            );
            return res.status(429).json({
                status: false,
                message: `Please wait ${wait}s before requesting another OTP.`,
            });
        }

        // cryptographically-random 6-digit code, not Math.random()
        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        order.deliveryOtpHash = otpHash;
        order.deliveryOtpExpires = new Date(Date.now() + OTP_TTL_MS);
        order.deliveryOtpAttempts = 0;
        order.deliveryOtpLastSentAt = new Date();
        await order.save();

        await SendDeliveryOtpEmail(order.user.email, otp, order);

        return res.status(200).json({
            status: true,
            message: "OTP sent to your registered email. It is valid for 10 minutes.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while sending the OTP",
        });
    }
};

// STEP 2 — verify the OTP and mark the order Delivered
export const VerifyDeliveryOtp = async (req, res) => {
    try {
        const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
        if (isRateLimited(ip)) {
            return res.status(429).json({
                status: false,
                message: "Too many requests. Please try again in a minute.",
            });
        }

        const { orderId, email, otp } = req.body;

        if (!otp || !/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({ status: false, message: "Enter the 6-digit OTP" });
        }

        const order = await findMatchingOrder(orderId, email);
        if (!order) {
            return res.status(404).json({ status: false, message: GENERIC_INVALID });
        }

        if (order.status !== "Shipping") {
            return res.status(400).json({
                status: false,
                message:
                    order.status === "Delivered"
                        ? "This order has already been marked as delivered."
                        : "This order isn't out for delivery yet, so it can't be confirmed.",
            });
        }

        if (!order.deliveryOtpHash || !order.deliveryOtpExpires) {
            return res.status(400).json({
                status: false,
                message: "No OTP was requested for this order. Please request one first.",
            });
        }

        if (order.deliveryOtpExpires.getTime() < Date.now()) {
            order.deliveryOtpHash = undefined;
            order.deliveryOtpExpires = undefined;
            await order.save();
            return res.status(400).json({
                status: false,
                message: "This OTP has expired. Please request a new one.",
            });
        }

        if (order.deliveryOtpAttempts >= MAX_VERIFY_ATTEMPTS) {
            order.deliveryOtpHash = undefined;
            order.deliveryOtpExpires = undefined;
            await order.save();
            return res.status(429).json({
                status: false,
                message: "Too many incorrect attempts. Please request a new OTP.",
            });
        }

        const isMatch = await bcrypt.compare(String(otp), order.deliveryOtpHash);

        if (!isMatch) {
            order.deliveryOtpAttempts += 1;
            await order.save();
            const remaining = MAX_VERIFY_ATTEMPTS - order.deliveryOtpAttempts;
            return res.status(400).json({
                status: false,
                message:
                    remaining > 0
                        ? `Incorrect OTP. ${remaining} attempt(s) remaining.`
                        : "Incorrect OTP. Please request a new one.",
            });
        }

        // success — mark delivered and clear the OTP fields
        order.status = "Delivered";
        order.deliveredAt = new Date();
        order.deliveryOtpHash = undefined;
        order.deliveryOtpExpires = undefined;
        order.deliveryOtpAttempts = 0;
        await order.save();

        SendDeliveryConfirmedEmail(order.user.email, order);

        return res.status(200).json({
            status: true,
            message: "Delivery confirmed! Thank you for shopping with us.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while verifying the OTP",
        });
    }
};
