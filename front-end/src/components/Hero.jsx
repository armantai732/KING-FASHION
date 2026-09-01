import React from "react";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="md:min-h-[90vh] h-[50vh] flex items-center px-[5%] text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-xl">
        <h4 className="text-[#d4af37] tracking-[3px] mb-4 font-medium">
          New Season Arrivals
        </h4>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
          STYLE THAT <br /> SPEAKS FOR <br />
          <span className="text-[#d4af37]">YOU</span>
        </h1>
        <p className="text-gray-200 mb-8 leading-relaxed">
          Discover the latest collection of men's fashion — shirts, t-shirts,
          pants, jackets & Track suit wear.
        </p>
        <button
          onClick={() => scrollTo("shirt")}
          className="inline-flex items-center gap-2 bg-[#d4af37] text-[#1a1a1a] px-8 py-3.5 rounded-full font-semibold hover:bg-white hover:-translate-y-1 transition-all duration-300"
        >
          Shop Now <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
