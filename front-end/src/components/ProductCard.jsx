import React, { useState } from "react";
import { Heart } from "lucide-react";
import { getColourHex } from "../utils/colourMap";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ item, alt, setOpen, setSelectedProduct, setSelectedImage, getImageUrl, handleAddToCart }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const liked = isWishlisted(item._id);
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] || "");
  const [selectedColour, setSelectedColour] = useState(undefined);

  // 🔑 size ke andar se colourStock nikaalo
  const getColoursForSize = (item, size) => {
    const entry = item.sizeStock?.find((s) => s.size === size);
    return entry?.colourStock || [];
  };

  // 🔑 size + colour ke combination ki quantity nikaalo
  const getQty = (item, size, colour) => {
    const entry = item.sizeStock?.find((s) => s.size === size);
    const colourEntry = entry?.colourStock?.find((c) => c.colour === colour);
    return colourEntry ? colourEntry.quantity : 0;
  };

  const activeSize = selectedSize || item.sizes?.[0];
  const availableColours = getColoursForSize(item, activeSize);
  const activeColour = selectedColour ?? availableColours[0]?.colour;
  const activeQty = getQty(item, activeSize, activeColour);
  const isOutOfStock = item.status === "Unavailable" || !activeColour || activeQty === 0;

  return (
    <div
      onClick={() => {
        setOpen(true)
        setSelectedProduct(item)
        setSelectedImage(getImageUrl(item.image[0]));
      }}
      className={`rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ${alt ? "bg-[#f7f6f3]" : "bg-white"
        }`}
    >
      <div
        className="relative h-32 sm:h-64 overflow-hidden group">
        <img
          src={item.image && item.image[0] ? (item.image[0].startsWith("http") ? item.image[0] : `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/uploads/${item.image[0].replace(/^uploads[\\/]/, "")}`) : ""}
          alt={item.name}
          className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-500"
        />
        {item.old && (
          <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-[#d4af37] text-[#1a1a1a] text-[9px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
            -{Math.round(100 - (item.price / item.old) * 100)}%
          </span>
        )}

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(item._id);
          }}
          className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            size={16}
            className={liked ? "text-[#d4af37]" : "text-gray-500"}
            fill={liked ? "#d4af37" : "none"}
          />
        </button>
      </div>
      <h4 className="mx-2.5 sm:mx-4 mt-2 sm:mt-4 text-xs sm:text-base font-semibold truncate">{item.name}</h4>
      <div className="mx-2.5 sm:mx-4 mt-1 sm:mt-2 mb-1.5 sm:mb-3 font-bold text-sm sm:text-lg">
        {item.old && (
          <span className="line-through text-gray-400 text-[10px] sm:text-sm font-normal mr-1 sm:mr-2">
            ₹{item.old.toLocaleString()}
          </span>
        )}
        ₹{item.price.toLocaleString()}
      </div>
      <div className="mx-2.5 sm:mx-4 mb-1.5 sm:mb-3">
        <span
          className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold rounded-full ${item.status === "Available"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {item.status}
        </span>
      </div>

      {/* Sizes */}
      <div className="mx-2.5 sm:mx-4 mb-3 flex flex-wrap gap-2">
        {item.sizes?.length > 0 ? (
          item.sizes.map((size, index) => (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSize(size);
                // 🔑 size badalne par colour reset karo (har size ke colours/quantity alag ho sakte hain)
                setSelectedColour(undefined);
              }}
              className={`min-w-8 rounded-md border-2 px-2 py-1 text-center text-xs font-semibold transition cursor-pointer ${activeSize === size
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-gray-100 text-gray-700 hover:border-black hover:bg-black hover:text-white"
                }`}
            >
              {size}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400">
            No Sizes
          </span>
        )}
      </div>

      {/* Colours — 🔑 ab size-specific colours aur quantity dikhenge */}
      <div className="mx-2.5 sm:mx-4 mb-3 flex flex-wrap gap-2">
        {availableColours.length > 0 ? (
          availableColours.map((c, index) => {
            const colourOut = c.quantity === 0;
            const isSelected = activeColour === c.colour;
            return (
              <span
                key={index}
                title={colourOut ? `${c.colour} (Out of stock)` : c.colour}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!colourOut) setSelectedColour(c.colour);
                }}
                className={`h-7 w-7 rounded-full transition border-2 ${colourOut ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:scale-110"
                  } ${isSelected ? "border-black ring-2 ring-black ring-offset-1" : "border-gray-300"}`}
                style={{ backgroundColor: getColourHex(c.colour) }}
              ></span>
            );
          })
        ) : (
          <span className="text-xs text-gray-400">No Colour</span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isOutOfStock) {
            handleAddToCart(item, activeSize, activeColour);
          }
        }}
        disabled={isOutOfStock}
        className={`mx-2.5 sm:mx-4 mb-2.5 sm:mb-4 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-base font-semibold transition-colors duration-300 ${isOutOfStock
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-[#1a1a1a] text-white hover:bg-[#d4af37] hover:text-[#1a1a1a]"
          }`}
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}