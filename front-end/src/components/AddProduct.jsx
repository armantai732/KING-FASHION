import React, { useRef, useState } from "react";
import { addProduct } from "../data/api";
import { toast } from "react-toastify";
import { UploadCloud, X } from "lucide-react";
import Select from "react-select";
import { getColourHex } from "../utils/colourMap";

function AddProduct() {
    const [form, setForm] = useState({
        name: "",
        price: "",
        old: "",
        costPrice: "",
        category: "",
        description: "",
        sizes: [],
        // 🔑 { M: { colours: ["Black","Red"], quantities: { Black: "5", Red: "3" } }, L: {...} }
        sizeColourStock: {},
    });

    const sizeOptions = [
        { value: "S", label: "S" },
        { value: "M", label: "M" },
        { value: "L", label: "L" },
        { value: "XL", label: "XL" },
        { value: "XXL", label: "XXL" },
        { value: "XXXL", label: "XXXL" },
        { value: "28", label: "28" },
        { value: "30", label: "30" },
        { value: "32", label: "32" },
        { value: "34", label: "34" },
        { value: "36", label: "36" },
        { value: "38", label: "38" },
        { value: "40", label: "40" },
    ];

    const colourOptions = [
        { value: "Black", label: "Black" },
        { value: "White", label: "White" },
        { value: "Blue", label: "Blue" },
        { value: "Navy Blue", label: "Navy Blue" },
        { value: "Sky Blue", label: "Sky Blue" },
        { value: "Light Blue", label: "Light Blue" },
        { value: "Dark Blue", label: "Dark Blue" },
        { value: "Grey", label: "Grey" },
        { value: "Light Grey", label: "Light Grey" },
        { value: "Dark Grey", label: "Dark Grey" },
        { value: "Charcoal", label: "Charcoal" },
        { value: "Red", label: "Red" },
        { value: "Maroon", label: "Maroon" },
        { value: "Pink", label: "Pink" },
        { value: "Light Pink", label: "Light Pink" },
        { value: "Green", label: "Green" },
        { value: "Olive Green", label: "Olive Green" },
        { value: "Dark Green", label: "Dark Green" },
        { value: "Mint Green", label: "Mint Green" },
        { value: "Yellow", label: "Yellow" },
        { value: "Mustard", label: "Mustard" },
        { value: "Orange", label: "Orange" },
        { value: "Brown", label: "Brown" },
        { value: "Dark Brown", label: "Dark Brown" },
        { value: "Beige", label: "Beige" },
        { value: "Khaki", label: "Khaki" },
        { value: "Cream", label: "Cream" },
        { value: "Off White", label: "Off White" },
        { value: "Purple", label: "Purple" },
        { value: "Lavender", label: "Lavender" },
        { value: "Turquoise", label: "Turquoise" },
        { value: "Teal", label: "Teal" },
        { value: "Wine", label: "Wine" },
        { value: "Peach", label: "Peach" },
        { value: "Rust", label: "Rust" },
        { value: "Camel", label: "Camel" },
        { value: "Coffee", label: "Coffee" },
        { value: "Burgundy", label: "Burgundy" },
        { value: "Chocolate", label: "Chocolate" },
        { value: "Denim Blue", label: "Denim Blue" },
    ];

    const fileInputRef = useRef(null);
    const [image, setImage] = useState([]);
    const [preview, setPreview] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // 🔑 Size select/deselect hone par sizeColourStock sync karo
    const handleSizeSelect = (selected) => {
        const selectedValues = selected.map((item) => item.value);
        setForm((prev) => {
            const updatedSizeColourStock = {};
            selectedValues.forEach((sz) => {
                updatedSizeColourStock[sz] =
                    prev.sizeColourStock[sz] || { colours: [], quantities: {} };
            });
            return { ...prev, sizes: selectedValues, sizeColourStock: updatedSizeColourStock };
        });
    };

    // 🔑 Ek particular size ke liye colours select karo
    const handleColourSelectForSize = (size, selected) => {
        const selectedValues = selected.map((item) => item.value);
        setForm((prev) => {
            const existing = prev.sizeColourStock[size] || { colours: [], quantities: {} };
            const updatedQuantities = {};
            selectedValues.forEach((c) => {
                updatedQuantities[c] = existing.quantities[c] ?? "";
            });
            return {
                ...prev,
                sizeColourStock: {
                    ...prev.sizeColourStock,
                    [size]: { colours: selectedValues, quantities: updatedQuantities },
                },
            };
        });
    };

    // 🔑 Ek particular size ke ek particular colour ki quantity change karo
    const handleQtyChangeForSize = (size, colour, value) => {
        setForm((prev) => ({
            ...prev,
            sizeColourStock: {
                ...prev.sizeColourStock,
                [size]: {
                    ...prev.sizeColourStock[size],
                    quantities: {
                        ...prev.sizeColourStock[size].quantities,
                        [colour]: value,
                    },
                },
            },
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImage((prev) => [...prev, ...files]);
        const previewUrls = files.map((file) => URL.createObjectURL(file));
        setPreview((prev) => [...prev, ...previewUrls]);
    };

    const removeImage = (index) => {
        setImage((prev) => prev.filter((_, i) => i !== index));
        setPreview((prev) => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setForm({
            name: "", price: "", old: "", costPrice: "",
            category: "", description: "", sizes: [], sizeColourStock: {},
        });
        setImage([]);
        setPreview([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // validation
        if (form.sizes.length === 0) {
            toast.error("Please select at least one size");
            return;
        }

        for (const sz of form.sizes) {
            const entry = form.sizeColourStock[sz];
            if (!entry || entry.colours.length === 0) {
                toast.error(`Please select colours for size ${sz}`);
                return;
            }
            const missingQty = entry.colours.some(
                (c) => entry.quantities[c] === "" || entry.quantities[c] === undefined
            );
            if (missingQty) {
                toast.error(`Please enter quantity for every colour in size ${sz}`);
                return;
            }
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("price", form.price);
            formData.append("old", form.old || "");
            formData.append("costPrice", form.costPrice || 0);
            formData.append("category", form.category);
            formData.append("description", form.description);

            // 🔑 size ke andar colour + quantity, sab ek hi array me
            const sizeStockArray = form.sizes.map((sz) => ({
                size: sz,
                colourStock: form.sizeColourStock[sz].colours.map((c) => ({
                    colour: c,
                    quantity: Number(form.sizeColourStock[sz].quantities[c]) || 0,
                })),
            }));
            formData.append("sizeStock", JSON.stringify(sizeStockArray));

            image.forEach((img) => {
                formData.append("image", img);
            });

            const res = await addProduct(formData);

            if (res.status) {
                toast.success("Product added successfully");
                resetForm();
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error.message);
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-gray-300 p-3 max-[400px]:p-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

    const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

    return (
        <div className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-0 sm:py-0">
            <h1 className="mb-4 text-2xl max-[400px]:text-xl font-bold sm:mb-5 sm:text-3xl">
                Add Product
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 max-[400px]:p-3 shadow sm:p-6"
            >
                {/* Name */}
                <div>
                    <label className={labelClass}>Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Classic Cotton Shirt"
                        required
                        className={inputClass}
                    />
                </div>

                {/* Price */}
                <div>
                    <label className={labelClass}>Price (Selling Price)</label>
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="₹ 0.00"
                        min="0"
                        required
                        className={inputClass}
                    />
                </div>

                {/* Original Price / MRP */}
                <div>
                    <label className={labelClass}>Original Price / MRP (optional — shown struck-through with an auto discount %)</label>
                    <input
                        type="number"
                        name="old"
                        value={form.old}
                        onChange={handleChange}
                        placeholder="₹ 0.00"
                        min="0"
                        className={inputClass}
                    />
                    {form.old && form.price && Number(form.old) > Number(form.price) && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                            {Math.round(100 - (Number(form.price) / Number(form.old)) * 100)}% discount will be shown on this product
                        </p>
                    )}
                    {form.old && form.price && Number(form.old) <= Number(form.price) && (
                        <p className="text-sm text-red-500 mt-1">
                            Original Price should be higher than Price for a discount to show
                        </p>
                    )}
                </div>

                {/* Cost Price */}
                <div>
                    <label className={labelClass}>Cost Price (optional, used for profit calculation)</label>
                    <input
                        type="number"
                        name="costPrice"
                        value={form.costPrice}
                        onChange={handleChange}
                        placeholder="₹ 0.00"
                        min="0"
                        className={inputClass}
                    />
                </div>

                {/* File upload */}
                <div>
                    <label className={labelClass}>Product Images</label>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 max-[400px]:p-4 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
                    >
                        <UploadCloud className="h-6 w-6 max-[400px]:h-5 max-[400px]:w-5 text-gray-400" />
                        <span className="text-sm max-[400px]:text-xs text-gray-500">
                            Tap to upload images
                        </span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Preview */}
                {preview.length > 0 && (
                    <div className="flex flex-wrap gap-3 max-[400px]:gap-2">
                        {preview.map((img, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={img}
                                    alt=""
                                    className="h-20 w-20 max-[400px]:h-16 max-[400px]:w-16 rounded-lg border object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Category */}
                <div>
                    <label className={labelClass}>Category</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="">Select Category</option>
                        <option value="shirt">Shirt</option>
                        <option value="Tshirt">T-Shirt</option>
                        <option value="pant">Pant</option>
                        <option value="shoes">Shoes</option>
                        <option value="jacket">Jacket</option>
                        <option value="tracksuit">Track Suit</option>
                    </select>
                </div>

                {/* Sizes */}
                <div>
                    <label className={labelClass}>Available Sizes</label>
                    <Select
                        isMulti
                        options={sizeOptions}
                        value={sizeOptions.filter((option) => form.sizes.includes(option.value))}
                        onChange={handleSizeSelect}
                        placeholder="Select Sizes"
                    />
                </div>

                {/* 🔑 Per-size colour + quantity blocks */}
                {form.sizes.length > 0 && (
                    <div className="space-y-4">
                        <label className={labelClass}>Colour & Quantity per Size</label>
                        {form.sizes.map((sz) => (
                            <div key={sz} className="rounded-lg border border-gray-200 p-3 max-[400px]:p-2.5">
                                <p className="mb-2 text-sm font-semibold text-gray-700">
                                    Size: <span className="text-blue-600">{sz}</span>
                                </p>
                                <Select
                                    isMulti
                                    options={colourOptions}
                                    value={colourOptions.filter((o) =>
                                        (form.sizeColourStock[sz]?.colours || []).includes(o.value)
                                    )}
                                    onChange={(selected) => handleColourSelectForSize(sz, selected)}
                                    placeholder={`Select colours for ${sz}`}
                                />

                                {(form.sizeColourStock[sz]?.colours || []).length > 0 && (
                                    <div className="mt-3 space-y-2.5">
                                        {form.sizeColourStock[sz].colours.map((c) => (
                                            <div key={c} className="flex items-center gap-3">
                                                <span
                                                    className="h-7 w-7 flex-shrink-0 rounded-full border border-gray-300 inline-block"
                                                    style={{ backgroundColor: getColourHex(c) }}
                                                    title={c}
                                                ></span>
                                                <span className="w-28 sm:w-32 text-sm text-gray-700 truncate">{c}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Qty"
                                                    value={form.sizeColourStock[sz].quantities[c] ?? ""}
                                                    onChange={(e) => handleQtyChangeForSize(sz, c, e.target.value)}
                                                    required
                                                    className={`${inputClass} w-24 sm:w-28`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Short description of the product"
                        rows="4"
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 max-[400px]:py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {submitting ? "Adding..." : "Add Product"}
                </button>
            </form>
        </div>
    );
}

export default AddProduct;