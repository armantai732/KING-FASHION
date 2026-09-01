import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronLeft } from "lucide-react";
import { GetWishlist } from "../data/api";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";

export default function Like({ setOpen, setSelectedProduct, setSelectedImage, getImageUrl, handleAddToCart }) {
  const navigate = useNavigate();
  const { wishlistIds, loadWishlist } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/Login");
      return;
    }

    (async () => {
      const res = await GetWishlist();
      if (res?.status) {
        setItems(res.wishlist || []);
      }
      setLoading(false);
      loadWishlist();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filter against the live wishlist ids from context so unliking a product
  // here removes it immediately, without needing to re-fetch.
  const visibleItems = items.filter((item) => wishlistIds.has(item._id));

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-3 sm:py-10 sm:px-6">
      <div className="max-w-7xl mx-auto mb-4 sm:mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 px-4 py-1.5 sm:px-5 sm:py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm sm:text-base"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto mb-6 sm:mb-10 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Heart className="text-[#d4af37]" fill="#d4af37" size={28} />
          My Wishlist
        </h1>
        <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
          Products you've saved — tap the heart again to remove them
        </p>
      </div>

      {loading ? (
        <div className="text-center mt-16 text-gray-500">Loading your wishlist...</div>
      ) : visibleItems.length === 0 ? (
        <div className="text-center mt-16">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-500">
            Your wishlist is empty
          </h2>
          <p className="text-gray-400 mt-2">
            Tap the heart icon on any product to save it here.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8">
          {visibleItems.map((item) => (
            <ProductCard
              key={item._id}
              item={item}
              alt={false}
              setOpen={setOpen}
              setSelectedProduct={setSelectedProduct}
              setSelectedImage={setSelectedImage}
              getImageUrl={getImageUrl}
              handleAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
