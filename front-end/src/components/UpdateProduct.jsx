import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSingleProduct, updateProduct } from "../data/api";
import { toast } from "react-toastify";
import Select from "react-select";
import { getColourHex } from "../utils/colourMap";

function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    { value: "42", label: "42" },
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

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await getSingleProduct(id);
      const data = res.data;

      setForm({
        name: data.name || "",
        price: data.price || "",
        old: data.old || "",
        costPrice: data.costPrice || "",
        category: data.category || "",
        description: data.description || "",
        sizes: (data.sizeStock || []).map((s) => s.size),
        sizeColourStock: (data.sizeStock || []).reduce((acc, s) => {
          const colours = (s.colourStock || []).map((c) => c.colour);
          const quantities = (s.colourStock || []).reduce((q, c) => {
            q[c.colour] = String(c.quantity ?? 0);
            return q;
          }, {});
          acc[s.size] = { colours, quantities };
          return acc;
        }, {}),
      });

      setExistingImages(data.image || []);
    } catch (error) {
      console.log(error);
      toast.error("Could not load product");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation — AddProduct jaisa hi
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
      // 🔑 size ke andar colour + quantity, sab ek hi array me
      const sizeStockArray = form.sizes.map((sz) => ({
        size: sz,
        colourStock: form.sizeColourStock[sz].colours.map((c) => ({
          colour: c,
          quantity: Number(form.sizeColourStock[sz].quantities[c]) || 0,
        })),
      }));

      // NOTE: images abhi bhi is form se update nahi hote — sirf text fields + sizeStock
      const res = await updateProduct(id, {
        name: form.name,
        price: form.price,
        old: form.old || "",
        costPrice: form.costPrice || 0,
        category: form.category,
        description: form.description,
        sizeStock: JSON.stringify(sizeStockArray),
      });

      if (res && res.status) {
        toast.success("Product Updated Successfully");
        navigate("/admin/product/get");
      } else {
        toast.error((res && res.message) || "Could not update product");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  if (loading) {
    return <div className="max-w-2xl bg-white p-6 rounded-lg shadow">Loading...</div>;
  }

  return (
    <div className="max-w-2xl bg-white p-6 rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-5">Update Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className={labelClass}>Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Classic Cotton Shirt"
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
            className={inputClass}
          />
        </div>

        {/* Original Price / MRP */}
        <div>
          <label className={labelClass}>
            Original Price / MRP (optional — shown struck-through with an auto discount %)
          </label>
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

        {/* Existing Images (read-only preview) */}
        <div>
          <label className={labelClass}>Product Images</label>
          {existingImages.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`product-${index}`}
                  className="h-20 w-20 rounded-lg border object-cover"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No images uploaded for this product.</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Images update yaha se abhi possible nahi hai — image change karne ke liye Add Product flow use karo.
          </p>
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
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

        {/* 🔑 Per-size colour + quantity blocks — auto-filled from existing product */}
        {form.sizes.length > 0 && (
          <div className="space-y-4">
            <label className={labelClass}>Colour & Quantity per Size</label>
            {form.sizes.map((sz) => (
              <div key={sz} className="rounded-lg border border-gray-200 p-3">
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
                          className="w-24 sm:w-28 border p-2 rounded text-sm"
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

        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}

export default UpdateProduct;