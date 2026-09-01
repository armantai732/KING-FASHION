import React, { useRef, useState } from "react";
import { Heart, ShoppingBag, Menu, X, User, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { id: "home", label: "Home" },
  { id: "shirt", label: "Shirt" },
  { id: "Tshirt", label: "T-Shirt" },
  { id: "pant", label: "Pant" },
  { id: "jacket", label: "Jacket" },
  { id: "tracksuit", label: "Track suit" },
];

export default function Header({ added, Search, setSearch, hideSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);


  const scrollTo = (id) => {
    setMenuOpen(false);

    const el = document.getElementById(id);

    if (el) {
      const headerHeight = headerRef.current?.offsetHeight || 0;

      window.scrollTo({
        top: el.offsetTop - headerHeight + 30,
        behavior: "smooth",
      });
    }
  };

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/Login");
  };

  const token = localStorage.getItem("token");

  const logout = () => {
    navigate("/logout");
  };

  return (
    <>
      {/* Topbar */}
      {/* <div className="bg-[#1a1a1a] text-white text-center text-xs sm:text-sm py-2 px-2 tracking-wide">
        Free Shipping on Orders Above ₹999 | Use Code{" "}
        <strong className="text-[#d4af37]">KING10</strong> for 10% OFF
      </div> */}

      {/* Header */}
      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-[5%] py-4">

          {/* Logo */}
          <div className="text-xl md:text-2xl font-extrabold tracking-widest">
            KING<span className="text-[#d4af37]">.</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate(`/category/${link.id}`) || link.id === "home" && navigate("/")
                }}
                className="font-medium text-sm hover:text-[#d4af37] transition-colors relative group"
              >
                {link.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#d4af37] group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3 md:gap-5">

            {/* Search */}

            {
              hideSearch && (
                <input
                  type="text"
                  value={Search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="hidden sm:block w-36 md:w-52 lg:w-64 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#d4af37]"
                />
              )
            }

            {/* Wishlist */}
            <Heart
              onClick={() => navigate("/like")}
              size={20}
              className="cursor-pointer hover:text-[#d4af37]"
            />

            {/* Cart */}
            <div onClick={() => navigate("/Cart")} className="relative cursor-pointer hover:text-[#d4af37]">
              <ShoppingBag size={20} />
              <span className="absolute -top-2 -right-2 bg-[#d4af37] text-[#1a1a1a] text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                {added}
              </span>
            </div>

            {/* Desktop Login / Logout */}
            {token ? (
              <button onClick={logout} className="hidden xl:flex">
                <LogOut size={20} />
              </button>
            ) : (
              <button onClick={goToLogin} className="hidden xl:flex">
                <User size={20} />
              </button>
            )}

            {/* Mobile Menu */}
            <button
              className="flex xl:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}

        {
          hideSearch && (
            <div className="sm:hidden px-4 pb-3">
              <input
                type="text"
                value={Search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          )
        }

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="xl:hidden bg-white border-t shadow-md px-4 py-4 flex flex-col">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  window.scrollTo(0, 0);
                  setMenuOpen(!menuOpen)
                  navigate(`/category/${link.id}`) || link.id === "home" && navigate("/")
                }}
                className="text-left py-2 font-medium hover:text-[#d4af37]"
              >
                {link.label}
              </button>
            ))}

            {token ? (
              <button
                onClick={logout}
                className="flex items-center gap-2 py-2 font-medium hover:text-[#d4af37]"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={goToLogin}
                className="flex items-center gap-2 py-2 font-medium hover:text-[#d4af37]"
              >
                <User size={20} />
                <span>Login</span>
              </button>
            )}
          </nav>
        )}
      </header>
    </>
  );
}