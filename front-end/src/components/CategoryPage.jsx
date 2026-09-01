import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { getproduct } from "../data/api";
import Header from "./Header";
import { getColourHex } from "../utils/colourMap";
import { useWishlist } from "../context/WishlistContext";

function CategoryPage({ Search, setSearch, setOpen, setSelectedProduct, setSelectedImage, getImageUrl, handleAddToCart }) {
    const { category } = useParams();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [selectedColours, setSelectedColours] = useState({});
    const [selectedSizes, setSelectedSizes] = useState({});

    useEffect(() => {
        fetchProducts();
    }, [category]);

    const fetchProducts = async () => {
        try {
            const res = await getproduct(category);
            setProducts(res.data);
        } catch (error) {
            console.log(error);
        }
    };

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

    const filterData = products
        .filter((item) => item.name.toLowerCase().includes(Search.toLowerCase()))
        .sort((a, b) => {
            if (a.status === "Unavailable" && b.status !== "Unavailable") return 1;
            if (a.status !== "Unavailable" && b.status === "Unavailable") return -1;
            return 0;
        });

    return (
        <>
            <div className="min-h-screen bg-gray-100 py-6 px-3 sm:py-10 sm:px-6">
                {/* Back Button */}
                <div className="max-w-7xl mx-auto mb-4 sm:mb-6">
                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-1.5 sm:px-5 sm:py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm sm:text-base"
                    >
                        ← Back
                    </button>
                </div>

                {/* Heading */}
                <div className="max-w-7xl mx-auto mb-6 sm:mb-10 text-center">
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 capitalize">
                        {category} Collection
                    </h1>
                    <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
                        Explore our latest {category} products
                    </p>
                </div>

                {/* Products */}
                <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8">
                    {filterData.map((item, index) => {
                        // 🔑 selected size ke basis par colours nikaalo
                        const selSize = selectedSizes[index] ?? item.sizes?.[0];
                        const availableColours = getColoursForSize(item, selSize);
                        const selColour = selectedColours[index] ?? availableColours[0]?.colour;
                        const selColourQty = getQty(item, selSize, selColour);
                        const isOutOfStock = item.status === "Unavailable" || selColourQty === 0;

                        return (
                            <div
                                key={index}
                                className="rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                            >
                                <div
                                    onClick={() => {
                                        setOpen(true);
                                        setSelectedProduct(item);
                                        setSelectedImage(getImageUrl(item.image[0]));
                                    }}
                                    className="relative h-32 sm:h-64 overflow-hidden group"
                                >
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
                                            className={isWishlisted(item._id) ? "text-[#d4af37]" : "text-gray-500"}
                                            fill={isWishlisted(item._id) ? "#d4af37" : "none"}
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
                                        item.sizes.map((size, sIndex) => {
                                            const isSizeSelected = (selectedSizes[index] ?? item.sizes[0]) === size;
                                            return (
                                                <span
                                                    key={sIndex}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedSizes((prev) => ({ ...prev, [index]: size }));
                                                        // 🔑 size badalne par colour reset karo (kyunki har size ke colours alag ho sakte hain)
                                                        setSelectedColours((prev) => ({ ...prev, [index]: undefined }));
                                                    }}
                                                    className={`min-w-8 rounded-md border-2 px-2 py-1 text-center text-xs font-semibold transition cursor-pointer ${isSizeSelected
                                                        ? "border-black bg-black text-white"
                                                        : "border-gray-300 bg-gray-100 text-gray-700 hover:border-black hover:bg-black hover:text-white"
                                                        }`}
                                                >
                                                    {size}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-xs text-gray-400">No Sizes</span>
                                    )}
                                </div>

                                {/* Colours — 🔑 ab size-specific colours dikhenge */}
                                <div className="mx-2.5 sm:mx-4 mb-3 flex flex-wrap gap-2">
                                    {availableColours.length > 0 ? (
                                        availableColours.map((c, cIndex) => {
                                            const isSelected = selColour === c.colour;
                                            const colourOut = c.quantity === 0;
                                            return (
                                                <span
                                                    key={cIndex}
                                                    title={colourOut ? `${c.colour} (Out of stock)` : c.colour}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!colourOut) {
                                                            setSelectedColours((prev) => ({ ...prev, [index]: c.colour }));
                                                        }
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
                                            handleAddToCart(item, selSize, selColour);
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
                    })}
                </div>

                {/* No Products */}
                {products.length === 0 && (
                    <div className="text-center mt-16">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-500">
                            No products found
                        </h2>
                    </div>
                )}
            </div>
        </>
    );
}

export default CategoryPage;