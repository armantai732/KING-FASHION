import React, { useState } from "react";

export default function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 2000);
    e.target.reset();
  };

  return (
    <section className="text-center py-20 px-[5%] bg-[#1a1a1a] text-white">
      <h2 className="text-3xl font-extrabold mb-3">
        Join the <span className="text-[#d4af37]">KING</span> Club
      </h2>
      <p className="text-gray-300 mb-8">
        Subscribe to get special offers, free giveaways, and new arrival updates.
      </p>
      <form onSubmit={handleSubscribe} className="flex justify-center gap-3 flex-wrap">
        <input
          type="email"
          required
          placeholder="Enter your email"
          className="px-5 py-3.5 rounded-full border-none w-80 text-sm text-black"
        />
        <button
          type="submit"
          className="px-8 py-3.5 rounded-full bg-[#d4af37] font-semibold hover:bg-white transition-colors duration-300"
        >
          {subscribed ? "Subscribed ✓" : "Subscribe"}
        </button>
      </form>
    </section>
  );
}
