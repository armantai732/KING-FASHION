import React from "react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] py-14 px-[5%]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">
          About <span className="text-[#d4af37]">KING</span>
        </h1>

        <p className="text-gray-600 leading-7 mb-4">
          KING Fashion Viramgam is a premium men's fashion brand offering
          shirts, t-shirts, pants, jackets and night wear at honest prices.
          We started with a simple idea — good quality clothing shouldn't
          be complicated to find or expensive to own.
        </p>

        <p className="text-gray-600 leading-7 mb-4">
          Every product on our store is chosen for comfort, durability and
          everyday style, so you can build a wardrobe that works for work,
          weekends and everything in between.
        </p>

        <p className="text-gray-600 leading-7">
          Have questions about an order or a product? Head over to our{" "}
          <a href="/contact" className="text-[#d4af37] font-semibold hover:underline">
            Contact page
          </a>{" "}
          — we're happy to help.
        </p>
      </div>
    </div>
  );
}
