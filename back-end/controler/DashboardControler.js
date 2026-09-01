import { Order } from "../model/Order.js";
import { Product } from "../model/Product.js";
import { User } from "../model/authModel.js";

export const GetDashboardStats = async (req, res) => {
    try {
        const allOrders = await Order.find();

        let pendingCount = 0;
        let shippingCount = 0;
        let deliveredCount = 0;
        let rejectedCount = 0;
        let cancelledCount = 0;

        let totalRevenue = 0; // money actually collected (delivered orders)
        let totalCost = 0; // what those delivered items cost us
        let pendingRevenue = 0; // value sitting in orders not yet delivered

        // productId -> { name, image, quantitySold }
        const productSales = {};

        for (const order of allOrders) {
            if (order.status === "Pending" || order.status === "Processing") pendingCount++;
            if (order.status === "Shipping") shippingCount++;
            if (order.status === "Delivered") deliveredCount++;
            if (order.status === "Rejected") rejectedCount++;
            if (order.status === "Cancelled") cancelledCount++;

            if (order.status === "Delivered") {
                totalRevenue += order.totalAmount;

                for (const item of order.items) {
                    totalCost += (item.costPrice || 0) * item.quantity;

                    const key = String(item.product);
                    if (!productSales[key]) {
                        productSales[key] = {
                            name: item.name,
                            image: item.image,
                            quantitySold: 0,
                            revenue: 0,
                        };
                    }
                    productSales[key].quantitySold += item.quantity;
                    productSales[key].revenue += item.price * item.quantity;
                }
            } else if (order.status === "Pending" || order.status === "Processing" || order.status === "Shipping") {
                pendingRevenue += order.totalAmount;
            }
        }

        const totalProfit = totalRevenue - totalCost;

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantitySold - a.quantitySold)
            .slice(0, 5);

        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments({ role: "user" });

        const recentOrders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(6);

        return res.status(200).json({
            status: true,
            stats: {
                totalOrders: allOrders.length,
                pendingCount,
                shippingCount,
                deliveredCount,
                rejectedCount,
                cancelledCount,
                totalRevenue,
                totalCost,
                totalProfit,
                pendingRevenue,
                totalProducts,
                totalUsers,
            },
            topProducts,
            recentOrders,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while loading dashboard stats",
        });
    }
};