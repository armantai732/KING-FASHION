import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GetWishlist, ToggleWishlist } from "../data/api";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  // Set of product ids the logged-in user has liked — stays until they unlike it.
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const navigate = useNavigate();

  const loadWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWishlistIds(new Set());
      return;
    }
    const res = await GetWishlist();
    if (res?.status) {
      setWishlistIds(new Set((res.wishlist || []).map((p) => (p?._id ? p._id : p))));
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const isWishlisted = useCallback(
    (productId) => wishlistIds.has(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/Login");
        return;
      }

      // optimistic update so the heart feels instant
      const wasLiked = wishlistIds.has(productId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.delete(productId);
        else next.add(productId);
        return next;
      });

      const res = await ToggleWishlist(productId);

      if (!res?.status) {
        // revert on failure
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (wasLiked) next.add(productId);
          else next.delete(productId);
          return next;
        });
        toast.error(res?.message || "Something went wrong");
        return;
      }

      toast.success(res.message || (res.liked ? "Saved to your wishlist" : "Removed from your wishlist"));
    },
    [wishlistIds, navigate]
  );

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist, loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
