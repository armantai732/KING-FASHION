import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import ProductSection from "../components/ProductSection";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { products } from "../data/products";
import { getproductlimit, TrackVisit } from "../data/api";
import { toast } from "react-toastify";

export default function Home({added, setOpen, setSelectedProduct, setSelectedImage, getImageUrl , handleAddToCart}) {
  // const [cartCount, setCartCount] = useState(0);

  // const handleAdd = () => setCartCount((c) => c + 1);

  const [product, setProduct] = useState({})

  const fecthData = async () => {
    const categories = ["shirt", "Tshirt", "pant", "shoes", "jacket", "tracksuit"];
    try {
      const results = await Promise.allSettled(
        categories.map((cat) => getproductlimit(cat))
      );

      const newProductState = {};
      categories.forEach((cat, index) => {
        const res = results[index];
        if (res.status === "fulfilled" && res.value && res.value.status) {
          newProductState[cat] = res.value.data;
        } else {
          newProductState[cat] = [];
        }
      });

      setProduct(newProductState);
    } catch (error) {
      toast.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    fecthData()
    TrackVisit()
  }, [])

  return (
    <div className="font-sans text-[#1a1a1a] bg-[#f7f6f3] min-h-screen">
      <Hero />
      <Categories />

      <ProductSection
        setOpen={setOpen}
        setSelectedProduct={setSelectedProduct}
        setSelectedImage={setSelectedImage}
        getImageUrl={getImageUrl}
        handleAddToCart={handleAddToCart}
        id="shirt" title="Shirts" items={product.shirt || []} alt={false} />
      <ProductSection
        setOpen={setOpen}
        setSelectedProduct={setSelectedProduct}
        setSelectedImage={setSelectedImage}
        getImageUrl={getImageUrl}
        handleAddToCart={handleAddToCart}
        id="Tshirt" title="T-Shirts" items={product.Tshirt || []} alt={true} />
      <ProductSection
        setOpen={setOpen}
        setSelectedProduct={setSelectedProduct}
        setSelectedImage={setSelectedImage}
        getImageUrl={getImageUrl}
        handleAddToCart={handleAddToCart}
        id="pant" title="Pants" items={product.pant || []} alt={false} />
      {/* <ProductSection id="shoes" title="Shoes" items={product.shoes || []} alt={true} added={added} handleAdd={handleAdd} /> */}
      <ProductSection
        setOpen={setOpen}
        setSelectedProduct={setSelectedProduct}
        setSelectedImage={setSelectedImage}
        getImageUrl={getImageUrl}
        handleAddToCart={handleAddToCart}
        id="jacket" title="Jackets" items={product.jacket || []} alt={false} />
      <ProductSection
        setOpen={setOpen}
        setSelectedProduct={setSelectedProduct}
        setSelectedImage={setSelectedImage}
        getImageUrl={getImageUrl}
        handleAddToCart={handleAddToCart}
        id="tracksuit" title="Track Suit" items={product.tracksuit || []} alt={true} />

      {/* <Newsletter /> */}
      <Footer />
    </div>
  );
}
