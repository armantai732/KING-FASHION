import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true }, // unit selling price at time of order
        costPrice: { type: Number, default: 0 }, // unit cost price at time of order (for profit calc)
        quantity: { type: Number, required: true },
        size: { type: String, required: true },
        colour: { type: String, required: true },
    },
    { _id: false }
);

const addressSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: "India" },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
        },
        address: {
            type: addressSchema,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["COD"],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending","Processing", "Paid", "Failed"],
            default: "Pending",
        },
        // Never store real card numbers / CVV — this only holds Razorpay's payment id
        paymentReference: {
            type: String,
        },
        itemsTotal: { type: Number, required: true },
        shippingFee: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Shipping", "Delivered", "Rejected", "Cancelled"],
            default: "Processing",
        },
        // set by admin when moving an order to "Shipping"
        expectedDeliveryDate: {
            type: Date,
        },
        // filled in when the customer cancels their own order
        cancelReason: {
            type: String,
        },
        cancelledAt: {
            type: Date,
        },
        // ---------- delivery confirmation OTP (self-serve, no login required) ----------
        // never store the raw OTP — only a bcrypt hash of it
        deliveryOtpHash: {
            type: String,
            select: false,
        },
        deliveryOtpExpires: {
            type: Date,
        },
        // wrong-guess counter for the current OTP; OTP is invalidated after too many tries
        deliveryOtpAttempts: {
            type: Number,
            default: 0,
        },
        // used to enforce a cooldown between "resend OTP" requests
        deliveryOtpLastSentAt: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
