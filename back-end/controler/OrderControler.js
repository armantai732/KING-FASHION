import { Order } from "../model/Order.js";
import { Cart } from "../model/Cart.js";
import { Product } from "../model/Product.js";
import { User } from "../model/authModel.js";
import { SendNewOrderEmail, SendOrderStatusEmail } from "../middleware/Email.js";
import crypto from "crypto";

const REQUIRED_ADDRESS_FIELDS = [
    "fullName",
    "phone",
    "addressLine",
    "city",
    "state",
    "pincode",
];

// 🔑 Helper: sizeStock ke andar se colour entry nikaalo (size + colour dono match)
const getSizeColourEntry = (product, size, colour) => {
    const sizeEntry = product.sizeStock?.find((s) => s.size === size);
    const colourEntry = sizeEntry?.colourStock?.find((c) => c.colour === colour);
    return colourEntry || null;
};

export const PlaceOrder = async (req, res) => {
    try {
        const {
            address,
            paymentMethod,
            cartItemIds,
        } = req.body;

        if (!address || typeof address !== "object") {
            return res.status(400).json({
                status: false,
                message: "Shipping address is required",
            });
        }

        for (const field of REQUIRED_ADDRESS_FIELDS) {
            if (!address[field] || !String(address[field]).trim()) {
                return res.status(400).json({
                    status: false,
                    message: `Address field "${field}" is required`,
                });
            }
        }

        if (!["COD", "Online"].includes(paymentMethod)) {
            return res.status(400).json({
                status: false,
                message: "Invalid payment method",
            });
        }

        let paymentStatus = "Pending";
        let paymentReference;

        const query = { user: req.user.id };
        if (Array.isArray(cartItemIds) && cartItemIds.length > 0) {
            query._id = { $in: cartItemIds };
        }

        const cartItems = await Cart.find(query).populate("product");

        if (!cartItems.length) {
            return res.status(400).json({
                status: false,
                message: "Your cart is empty",
            });
        }

        // ---------- 🔑 STOCK CHECK: size + colour dono ke hisaab se quantity verify karo ----------
        for (const ci of cartItems) {
            const product = ci.product;
            if (!product) {
                return res.status(400).json({
                    status: false,
                    message: "One of the products in your cart no longer exists",
                });
            }

            const colourEntry = getSizeColourEntry(product, ci.size, ci.colour);
            const availableQty = colourEntry ? colourEntry.quantity : 0;

            if (product.status === "Unavailable" || availableQty < ci.quantity) {
                return res.status(400).json({
                    status: false,
                    message: `"${product.name}" (${ci.size} / ${ci.colour}) is out of stock or doesn't have enough quantity (only ${availableQty} left)`,
                });
            }
        }

        const items = cartItems.map((ci) => ({
            product: ci.product?._id,
            name: ci.product?.name || "Product",
            image: ci.product?.image?.[0] || "",
            price: ci.price,
            costPrice: ci.product?.costPrice || 0,
            quantity: ci.quantity,
            size: ci.size,
            colour: ci.colour,
        }));

        const itemsTotal = items.reduce(
            (sum, it) => sum + it.price * it.quantity,
            0
        );

        const shippingFee = itemsTotal >= 999 ? 0 : 79;
        const totalAmount = itemsTotal + shippingFee;

        const order = await Order.create({
            user: req.user.id,
            items,
            address,
            paymentMethod,
            paymentStatus,
            paymentReference,
            itemsTotal,
            shippingFee,
            totalAmount,
        });

        // ---------- 🔑 STOCK UPDATE: size + colour ke hisaab se quantity kam karo ----------
        for (const ci of cartItems) {
            const product = ci.product;
            const colourEntry = getSizeColourEntry(product, ci.size, ci.colour);
            if (colourEntry) {
                colourEntry.quantity -= ci.quantity;
                if (colourEntry.quantity < 0) colourEntry.quantity = 0; // safety net
            }
            product.markModified("sizeStock"); // 🔑 nested array — isके bina Mongoose change track nahi karega
            await product.save(); // pre("save") hook total quantity/status khud recalc kar dega
        }

        // Clear only the ordered items from the cart
        await Cart.deleteMany({ _id: { $in: cartItems.map((ci) => ci._id) } });

        // Remember this address on the user's profile for next time
        await User.findByIdAndUpdate(req.user.id, {
            savedAddress: {
                fullName: address.fullName,
                phone: address.phone,
                addressLine: address.addressLine,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                country: address.country || "India",
            },
        });

        // Notify admin(s) by email that a new order has come in
        const customer = await User.findById(req.user.id);
        const admins = await User.find({ role: "admin" });

        const adminEmails =
            admins.length > 0
                ? admins.map((a) => a.email)
                : [process.env.EMAIL_USER];

        for (const adminEmail of adminEmails) {
            SendNewOrderEmail(adminEmail, order, customer);
        }

        return res.status(201).json({
            status: true,
            message: "Order placed successfully!",
            order,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while placing the order",
        });
    }
};

export const GetMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            status: true,
            orders,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while fetching orders",
        });
    }
};

// ---------- 🔑 Helper: cancel/reject hone par size+colour ka stock wapas add karo ----------
const restockOrderItems = async (order) => {
    for (const item of order.items) {
        if (!item.product) continue;
        const product = await Product.findById(item.product);
        if (!product) continue;

        const colourEntry = getSizeColourEntry(product, item.size, item.colour);
        if (colourEntry) {
            colourEntry.quantity += item.quantity;
        }
        product.markModified("sizeStock");
        await product.save(); // status khud "Available" ho jayega agar total quantity > 0
    }
};

export const CancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || !String(reason).trim()) {
            return res.status(400).json({
                status: false,
                message: "Please tell us why you're cancelling this order",
            });
        }

        const order = await Order.findOne({ _id: id, user: req.user.id });

        if (!order) {
            return res.status(404).json({
                status: false,
                message: "Order not found",
            });
        }

        const nonCancellable = ["Shipping", "Delivered", "Rejected", "Cancelled"];
        if (nonCancellable.includes(order.status)) {
            return res.status(400).json({
                status: false,
                message: `This order can no longer be cancelled (currently ${order.status})`,
            });
        }

        order.status = "Cancelled";
        order.cancelReason = String(reason).trim();
        order.cancelledAt = new Date();
        await order.save();

        // 🔑 stock wapas add karo
        await restockOrderItems(order);

        return res.status(200).json({
            status: true,
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while cancelling the order",
        });
    }
};

export const GetSavedAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("savedAddress");

        return res.status(200).json({
            status: true,
            address: user?.savedAddress || null,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while fetching address",
        });
    }
};


// ================= ADMIN ONLY =================

export const GetAllOrdersAdmin = async (req, res) => {
    try {
        const { status } = req.query;

        const query = {};
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            status: true,
            orders,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while fetching orders",
        });
    }
};

export const UpdateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, expectedDeliveryDate } = req.body;

        const allowedStatus = ["Shipping", "Delivered", "Rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Invalid status value",
            });
        }

        if (status === "Shipping" && !expectedDeliveryDate) {
            return res.status(400).json({
                status: false,
                message: "Expected delivery date is required when marking as Shipping",
            });
        }

        const order = await Order.findById(id).populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                status: false,
                message: "Order not found",
            });
        }

        const wasAlreadyRejected = order.status === "Rejected";

        order.status = status;
        if (status === "Shipping") {
            order.expectedDeliveryDate = expectedDeliveryDate;
        }
        await order.save();

        // 🔑 agar admin order reject kar raha hai to stock wapas add karo
        if (status === "Rejected" && !wasAlreadyRejected) {
            await restockOrderItems(order);
        }

        // let the customer know their order status changed
        if (order.user?.email) {
            SendOrderStatusEmail(order.user.email, order);
        }

        return res.status(200).json({
            status: true,
            message: "Order status updated",
            order,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while updating order status",
        });
    }
};