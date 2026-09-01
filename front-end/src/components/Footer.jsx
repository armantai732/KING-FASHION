import React from "react";
import { useNavigate } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";

const shopLinks = [
  { id: "shirt", label: "Shirts" },
  { id: "Tshirt", label: "T-Shirts" },
  { id: "pant", label: "Pants" },
  { id: "jacket", label: "Jackets" },
  { id: "night", label: "Night Dress" },
];

const companyLinks = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
];

// placeholder social links — swap these for your real profile URLs
const socialLinks = [
  { Icon: Facebook, href: "https://facebook.com" },
  { Icon: Instagram, href: "https://instagram.com" },
  { Icon: Twitter, href: "https://twitter.com" },
  { Icon: Youtube, href: "https://youtube.com" },
];

export default function Footer() {
  const navigate = useNavigate();

  const goToCategory = (id) => {
    window.scrollTo(0, 0);
    navigate(`/category/${id}`);
  };

  const goTo = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  return (
    <>
      <footer className="grid grid-cols-1 md:grid-cols-4 gap-10 py-14 px-[5%] bg-[#111] text-gray-400">
        <div>
          <div className="text-2xl font-extrabold tracking-widest text-white mb-4">
            KING<span className="text-[#d4af37]">.</span>
          </div>
          <p className="text-sm leading-relaxed mb-4">
            Premium men's fashion brand offering shirts, tshirts, pants,
            jackets and track suit wear at the best prices.
          </p>
          <div className="flex gap-4">
            {socialLinks.map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-[#222] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#d4af37] hover:text-[#1a1a1a] transition-colors duration-300"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Shop</h3>
          {shopLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => goToCategory(link.id)}
              className="block text-sm mb-3 hover:text-[#d4af37] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          {companyLinks.map((link) => (
            <button
              key={link.to}
              onClick={() => goTo(link.to)}
              className="block text-sm mb-3 hover:text-[#d4af37] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Get In Touch</h3>
          <a
            href="https://maps.google.com/?q=Ahmedabad,Gujarat,India"
            target="_blank"
            rel="noreferrer"
            className="text-sm mb-3 flex items-center gap-2 hover:text-[#d4af37] transition-colors"
          >
            <MapPin size={14} /> Ahmedabad, Gujarat, India
          </a>
          <a
            href="tel:+919876543210"
            className="text-sm mb-3 flex items-center gap-2 hover:text-[#d4af37] transition-colors"
          >
            <Phone size={14} /> +91 98765 43210
          </a>
          <a
            href="mailto:support@king.com"
            className="text-sm mb-3 flex items-center gap-2 hover:text-[#d4af37] transition-colors"
          >
            <Mail size={14} /> support@king.com
          </a>
        </div>
      </footer>

      <div className="text-center py-4 bg-[#0a0a0a] text-gray-500 text-sm">
        © 2026 KING. All Rights Reserved.
      </div>
    </>
  );
}
