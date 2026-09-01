import { Cart } from "../model/Cart.js";
import { Product } from "../model/Product.js";


export const AddCart = async (req, res) => {
    try {
        const { productId, quantity, size, colour } = req.body;

        if (!productId || !size || !colour) {
            return res.status(400).json({
                status: false,
                message: "productId, size and colour are required",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product Not Found",
            });
        }

        const qty = Number(quantity) > 0 ? Number(quantity) : 1;

        const alreadyExists = await Cart.findOne({
            user: req.user.id,
            product: productId,
            size,
            colour,
        });

        if (alreadyExists) {
            alreadyExists.quantity += qty;
            await alreadyExists.save();

            return res.json({
                status: true,
                message: "Quantity Updated",
                cart: alreadyExists,
            });
        }

        const cart = await Cart.create({
            user: req.user.id,
            product: productId,
            quantity: qty,
            size,
            colour,
            price: product.price, // unit price, snapshot at time of adding
        });

        return res.status(201).json({
            status: true,
            message: "Add To cart Succesfully!",
            cart,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while adding to cart",
        });
    }
};


export const GetCart = async (req, res) => {
    try {
        const cartItems = await Cart.find({ user: req.user.id })
            .populate("product")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            status: true,
            cart: cartItems,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while fetching cart",
        });
    }
};


export const UpdateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || Number(quantity) < 1) {
            return res.status(400).json({
                status: false,
                message: "Quantity must be at least 1",
            });
        }

        const item = await Cart.findOne({ _id: id, user: req.user.id });

        if (!item) {
            return res.status(404).json({
                status: false,
                message: "Cart item not found",
            });
        }

        item.quantity = Number(quantity);
        await item.save();

        return res.status(200).json({
            status: true,
            message: "Cart updated",
            cart: item,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while updating cart",
        });
    }
};


export const DeleteCartItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Cart.findOneAndDelete({ _id: id, user: req.user.id });

        if (!item) {
            return res.status(404).json({
                status: false,
                message: "Cart item not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Item removed from cart",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while removing cart item",
        });
    }
};
