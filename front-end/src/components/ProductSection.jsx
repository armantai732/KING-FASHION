import React from "react";
import ProductCard from "./ProductCard";

export default function ProductSection({ id, title, items, alt, setOpen, setSelectedProduct, setSelectedImage, getImageUrl , handleAddToCart}) {
  return (
    <section id={id} className={`py-8 sm:py-16 px-3 sm:px-[5%] ${alt ? "bg-white" : ""}`}>
      <h2 className="text-center text-xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-10">
        Men's <span className="text-[#d4af37]">{title}</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {items.map((item, i) => (
          <ProductCard
            setOpen={setOpen}
            setSelectedProduct={setSelectedProduct}
            setSelectedImage={setSelectedImage}
            getImageUrl={getImageUrl}
            handleAddToCart={handleAddToCart}
            key={i} item={item} alt={alt} />
        ))}
      </div>
    </section>
  );
}