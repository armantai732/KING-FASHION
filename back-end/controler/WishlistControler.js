import { User } from "../model/authModel.js";
import { Product } from "../model/Product.js";

// Add/remove a product from the logged-in user's permanent wishlist.
// Stays saved until the user unlikes it (clicks the heart again).
export const ToggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ status: false, message: "productId is required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ status: false, message: "Product Not Found" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ status: false, message: "User Not Found" });
        }

        const alreadyLiked = user.wishlist.some((id) => id.toString() === productId);

        if (alreadyLiked) {
            user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
            await user.save();
            return res.status(200).json({
                status: true,
                liked: false,
                message: "Removed from your wishlist",
                wishlist: user.wishlist,
            });
        }

        user.wishlist.push(productId);
        await user.save();

        return res.status(200).json({
            status: true,
            liked: true,
            message: "Saved to your wishlist",
            wishlist: user.wishlist,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while updating your wishlist",
        });
    }
};

// Full wishlist with populated product details (for the "/like" page)
export const GetWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("wishlist");
        if (!user) {
            return res.status(404).json({ status: false, message: "User Not Found" });
        }

        return res.status(200).json({
            status: true,
            wishlist: user.wishlist,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while fetching your wishlist",
        });
    }
};
