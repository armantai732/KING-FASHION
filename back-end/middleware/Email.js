import { transporter } from "./email.config.js";

export const SendVerficationCode = async (email, verificationCode) => {
    try {

        const response = await transporter.sendMail({
            from: `"King Fashion Viramgam" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Email Verification OTP",
            text: `Your OTP is ${verificationCode}`,
            html: `
                <h2>Email Verification</h2>
                <p>Your OTP is:</p>
                <h1>${verificationCode}</h1>
                <p>This OTP is valid for 10 minutes.</p>
            `,
        });


    } catch (error) {
        console.log("Email Error:", error);
    }
};

// Sent when a user requests to reset their forgotten password
export const SendPasswordResetOtpEmail = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"King Fashion Viramgam" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset OTP",
            text: `Your password reset OTP is ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
            html: `
                <h2>Reset Your Password</h2>
                <p>Use the OTP below to reset your password:</p>
                <h1 style="letter-spacing:4px;">${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
                <p style="color:#b00;">If you didn't request this, you can safely ignore this email.</p>
            `,
        });
    } catch (error) {
        console.log("Email Error:", error);
    }
};

// Sent to the admin whenever a customer places a new order
export const SendNewOrderEmail = async (adminEmail, order, customer) => {
    try {
        const itemsHtml = order.items
            .map(
                (it) =>
                    `<li>${it.name} — Size: ${it.size}, Colour: ${it.colour}, Qty: ${it.quantity}, ₹${it.price} each</li>`
            )
            .join("");

        await transporter.sendMail({
            from: `"King Fashion Viramgam" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `New Order Received — #${order._id}`,
            html: `
                <h2>New Order Received</h2>
                <p><b>Customer:</b> ${customer.name} (${customer.email})</p>
                <p><b>Order ID:</b> ${order._id}</p>
                <h3>Items</h3>
                <ul>${itemsHtml}</ul>
                <p><b>Total Amount:</b> ₹${order.totalAmount}</p>
                <p><b>Payment Method:</b> ${order.paymentMethod} (${order.paymentStatus})</p>
                <h3>Shipping Address</h3>
                <p>
                    ${order.address.fullName}<br/>
                    ${order.address.addressLine}<br/>
                    ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br/>
                    ${order.address.country}<br/>
                    Phone: ${order.address.phone}
                </p>
                <p>Status is currently <b>Pending</b>. Please review it in the admin panel.</p>
            `,
        });
    } catch (error) {
        console.log("Email Error:", error);
    }
};

// Sent to the customer when they request an OTP to confirm delivery of their own order
export const SendDeliveryOtpEmail = async (email, otp, order) => {
    try {
        await transporter.sendMail({
            from: `"King Fashion Viramgam" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Delivery Confirmation OTP — Order #${order._id}`,
            text: `Your delivery confirmation OTP is ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
            html: `
                <h2>Delivery Confirmation</h2>
                <p>Use the OTP below to confirm delivery of your order <b>#${order._id}</b>:</p>
                <h1 style="letter-spacing:4px;">${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
                <p style="color:#b00;">Never share this OTP with anyone, including someone claiming to be from our delivery team.</p>
            `,
        });
    } catch (error) {
        console.log("Email Error:", error);
    }
};

// Sent to the customer once they've successfully confirmed delivery themselves
export const SendDeliveryConfirmedEmail = async (email, order) => {
    try {
        await transporter.sendMail({
            from: `"King Fashion Viramgam" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Order #${order._id} marked as Delivered`,
            html: `
                <h2>Delivery Confirmed</h2>
                <p>Thanks! Your order <b>#${order._id}</b> has been marked as <b>Delivered</b>.</p>
                <p>We hope you love your purchase. Thank you for shopping with King Fashion Viramgam!</p>
            `,
        });
    } catch (error) {
        console.log("Email Error:", error);
    }
};

// Sent to the customer whenever the admin updates their order status
export const SendOrderStatusEmail = async (userEmail, order) => {
    try {
        let subject = `Your Order #${order._id} status: ${order.status}`;
        let message = `Your order status is now: <b>${order.status}</b>`;

        if (order.status === "Shipping") {
            const date = order.expectedDeliveryDate
                ? new Date(order.expectedDeliveryDate).toDateString()
                : "soon";
            message = `Good news! Your order has been shipped. Expected delivery by <b>${date}</b>.`;
        } else if (order.status === "Delivered") {
            message = `Your order has been delivered successfully. Thank you for shopping with us!`;
        } else if (order.status === "Rejected") {
            message = `Unfortunately your order has been rejected/cancelled. Please contact us if you have any questions.`;
        }

        await transporter.sendMail({
            from: `"King Fashion Viramgam" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject,
            html: `
                <h2>Order Update</h2>
                <p>${message}</p>
                <p><b>Order ID:</b> ${order._id}</p>
                <p><b>Total Amount:</b> ₹${order.totalAmount}</p>
            `,
        });
    } catch (error) {
        console.log("Email Error:", error);
    }
};