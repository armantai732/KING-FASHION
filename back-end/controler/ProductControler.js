import { Product } from "../model/Product.js";
import cloudinary from "../config/cloudinary.js";


export const createProduct = async (req, res) => {
    try {
        const { name, price, old, costPrice, category, description, sizeStock } = req.body;
        const parsedSizeStock = sizeStock ? JSON.parse(sizeStock) : [];

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ status: false, message: "Please select at least one image" });
        }

        const results = await Promise.all(req.files.map((file) => cloudinary.uploader.upload(file.path)));
        const imageUrls = results.map((r) => r.secure_url);

        const product = await Product.create({
            name,
            price,
            old: old || undefined,
            costPrice: costPrice || 0,
            image: imageUrls,
            category,
            description,
            sizeStock: parsedSizeStock.map((s) => ({
                size: s.size,
                colourStock: (s.colourStock || []).map((c) => ({
                    colour: c.colour,
                    quantity: Number(c.quantity) || 0,
                })),
            })),
            // sizes, colour, quantity, status — pre("save") hook khud set karega
        });

        return res.status(201).json({ status: true, message: "Product added successfully!", data: product });
    } catch (error) {
        console.log("ERROR:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getProduct = async (req, res) => {
    try {
        const { category } = req.params;

        // status: 1 → "Available" (A) < "Unavailable" (U), so Available pehle aayega
        const product = await Product.find({ category }).sort({ status: 1, createdAt: -1 });

        res.status(200).json({
            status: true,
            message: "Product Get succesfully!",
            data: product
        })
    } catch (error) {
        console.log(error.message)
    }
}

export const getAllProduct = async (req, res) => {
    try {
        const product = await Product.find().sort({ status: 1, createdAt: -1 });

        return res.status(200).json({
            status: true,
            message: "Get all Product",
            data: product
        })
    } catch (error) {
        console.log(error.message)
    }
}

// export const getAllProduct = async (req, res) => {
//     try {

//         const product = await Product.find()

//         return res.status(200).json({
//             status: true,
//             message: "Get all Product",
//             data: product
//         })

//     } catch (error) {
//         console.log(error.message)
//     }
// }



// Single Product Get By ID
export const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            status: true,
            message: "Product fetched successfully",
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Update Product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, old, costPrice, category, description, sizeStock } = req.body;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ status: false, message: "Product not found" });

        if (name !== undefined) product.name = name;
        if (price !== undefined) product.price = price;
        product.old = old || undefined;
        if (costPrice !== undefined) product.costPrice = costPrice;
        if (category !== undefined) product.category = category;
        if (description !== undefined) product.description = description;

        if (sizeStock !== undefined) {
            product.sizeStock = JSON.parse(sizeStock).map((s) => ({
                size: s.size,
                colourStock: (s.colourStock || []).map((c) => ({
                    colour: c.colour,
                    quantity: Number(c.quantity) || 0,
                })),
            }));
        }

        await product.save(); // hook quantity/status/sizes/colour recalc kar dega

        res.status(200).json({ status: true, message: "Product updated successfully", data: product });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};


// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found",
            });
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({
            status: true,
            message: "Product deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


export const updatestatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const product = await Product.findByIdAndUpdate(id, { status }, { returnDocument: "after" })
        res.status(200).json({
            success: true,
            product,
        });

    } catch (error) {
        console.log(error.message)
    }
}



export const getProductlimit = async (req, res) => {
    try {

        const { category } = req.params;

        const product = await Product.find({ category }).sort({ createdAt: -1 }).limit(4)

        res.status(200).json({
            status: true,
            message: "Product Get succesfully!",
            data: product
        })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
}