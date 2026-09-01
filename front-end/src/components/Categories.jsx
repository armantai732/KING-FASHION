import React from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  { id: "shirt", label: "Shirt" },
  { id: "Tshirt", label: "T-Shirt" },
  { id: "pant", label: "Pant" },
  // { id: "shoes", label: "Shoes" },
  { id: "jacket", label: "Jacket" },
  { id: "tracksuit", label: "Track Suit" },
];

export default function Categories() {
  const navigate = useNavigate()


  return (
    <section className="flex flex-wrap justify-between gap-4 py-12 px-[5%] bg-white">
      
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => {
            window.scrollTo(0, 0);
            navigate(`/category/${cat.id}`)
          }}
          className="flex-1 min-w-[140px] text-center py-8 px-2 border border-gray-100 rounded-xl hover:bg-[#1a1a1a] hover:text-white transition-all duration-300 hover:-translate-y-2"
        >
          <div className="text-2xl text-[#d4af37] mb-3">●</div>
          <h3 className="text-base font-semibold">{cat.label}</h3>
        </button>
      ))
      }
    </section >
  );
}
