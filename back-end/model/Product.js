import mongoose from "mongoose";

const COLOUR_ENUM = [
  "Black", "White", "Blue", "Navy Blue", "Sky Blue", "Light Blue", "Dark Blue", "Grey", "Light Grey", "Dark Grey", "Charcoal", "Red", "Maroon", "Pink", "Light Pink", "Green", "Olive Green", "Dark Green", "Mint Green", "Yellow", "Mustard", "Orange", "Brown", "Dark Brown", "Beige", "Khaki", "Cream", "Off White", "Purple", "Lavender", "Turquoise", "Teal", "Wine", "Peach", "Rust", "Camel", "Coffee", "Burgundy", "Chocolate", "Denim Blue"
];

const SIZE_ENUM = ["S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40", "42"];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    old: { type: Number },
    costPrice: { type: Number, default: 0 },
    image: { type: [String], default: [], required: true },
    category: { type: String, required: true },
    description: { type: String },

    quantity: { type: Number, default: 0 }, // auto-calculated
    status: { type: String, enum: ["Available", "Unavailable"], default: "Available" },

    // 🔑 sirf display/filter ke liye — auto derive hoga sizeStock se
    sizes: { type: [String], enum: SIZE_ENUM, default: [] },
    colour: { type: [String], enum: COLOUR_ENUM, default: [] },

    // 🔑 NEW: size ke andar har colour ki apni quantity
    sizeStock: {
      type: [
        {
          size: { type: String, enum: SIZE_ENUM, required: true },
          colourStock: {
            type: [
              {
                colour: { type: String, enum: COLOUR_ENUM, required: true },
                quantity: { type: Number, default: 0, min: 0 },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
      required: true,
    },
  },
  { timestamps: true }
);

// sizeStock se total quantity, status, sizes[], colour[] auto-calculate
productSchema.pre("save", function () {
  let totalQty = 0;
  const sizesSet = new Set();
  const coloursSet = new Set();

  (this.sizeStock || []).forEach((s) => {
    sizesSet.add(s.size);
    (s.colourStock || []).forEach((c) => {
      totalQty += Number(c.quantity) || 0;
      coloursSet.add(c.colour);
    });
  });

  this.quantity = totalQty;
  this.status = totalQty > 0 ? "Available" : "Unavailable";
  this.sizes = Array.from(sizesSet);
  this.colour = Array.from(coloursSet);
});

export const Product = mongoose.model("Product", productSchema);