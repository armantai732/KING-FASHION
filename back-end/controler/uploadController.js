import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);

        res.json({
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const uploadImages = async (req, res) => {
    try {
        const results = await Promise.all(
            req.files.map((file) =>
                cloudinary.uploader.upload(file.path)
            )
        );

        const imageUrls = results.map((r) => r.secure_url);

        res.json({
            success: true,
            images: imageUrls,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};