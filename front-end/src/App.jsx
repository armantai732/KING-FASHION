import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Logout from "./components/Logout";
import DeliveryOtp from "./pages/DeliveryOtp";
import CategoryPage from "./components/CategoryPage";
import Adminpage from "./pages/AdminPage";
import AddProduct from "./components/AddProduct";
import GetProduct from "./components/GetProduct";
import UpdateProduct from "./components/UpdateProduct";
import AdminOrders from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import Header from "./components/Header";
import Cart from "./components/Cart";
import Like from "./pages/Like";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import { toast } from "react-toastify";
import { AddCart, GetCart } from "./data/api";
import { getColourHex } from "./utils/colourMap";

export default function App() {
  const [added, setAdded] = useState(0);
  const [selectedsize, setselectedsize] = useState("M");
  const [selectedcolour, setselectedcolour] = useState("");
  const [Search, setSearch] = useState("");
  const location = useLocation();
  const [open, setOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState("");
  const navigate = useNavigate("");

  const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    return `${apiUrl}/uploads/${img.replace(/^uploads[\\/]/, "")}`;
  };

  // 🔑 size ke andar se colourStock nikaalo
  const getColoursForSize = (product, size) => {
    const entry = product?.sizeStock?.find((s) => s.size === size);
    return entry?.colourStock || [];
  };

  // 🔑 size + colour ke combination ki quantity nikaalo
  const getQty = (product, size, colour) => {
    const entry = product?.sizeStock?.find((s) => s.size === size);
    const colourEntry = entry?.colourStock?.find((c) => c.colour === colour);
    return colourEntry ? colourEntry.quantity : 0;
  };

  useEffect(() => {
    if (selectedProduct?.sizes?.length > 0) {
      const firstSize = selectedProduct.sizes[0];
      setselectedsize(firstSize);
      // 🔑 size ke hisaab se pehla available colour select karo
      const colours = getColoursForSize(selectedProduct, firstSize);
      setselectedcolour(colours[0]?.colour || "");
    }
  }, [selectedProduct])

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      const res = await GetCart();
      if (res?.status) {
        setAdded(res.cart?.length || 0);
      }
    })();
  }, [])

  // 🔑 FIX 1: jab modal (open) khula ho, background page scroll na ho
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);


  const hideHeader =
    [
      "/Login",
      "/logout",
      "/deliveryotp",
      "/admin",
      "/admin/product/get",
      "/admin/product/add",
      "/admin/dashboard",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/admin/product/update/") ||
    location.pathname.startsWith("/admin/orders");

  const hideSearch = 
  location.pathname !== "/" &&
  location.pathname !== "/Cart";


  const handleAddToCart = async (product, size, colour) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/Login");
        return;
      }

      const res = await AddCart({
        productId: product._id,
        quantity: 1,
        size,
        colour,
      });

      if (res.status) {
        toast.success(res.message);
        setAdded((prev) => prev + 1);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 🔑 modal ke liye size-specific colours aur quantity
  const modalColours = selectedProduct ? getColoursForSize(selectedProduct, selectedsize) : [];
  const modalQty = selectedProduct ? getQty(selectedProduct, selectedsize, selectedcolour) : 0;
  const modalOutOfStock = !selectedProduct || selectedProduct.status === "Unavailable" || !selectedcolour || modalQty === 0;

  return (
    <>
      {!hideHeader && (
        <Header
          added={added}
          Search={Search}
          setSearch={setSearch}
          hideSearch={hideSearch}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              added={added}
              Search={Search}
              setSearch={setSearch}
              open={open}
              setOpen={setOpen}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              setSelectedImage={setSelectedImage}
              getImageUrl={getImageUrl}
              handleAddToCart={handleAddToCart}
            />
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/deliveryotp" element={<DeliveryOtp />} />

        <Route
          path="/category/:category"
          element={
            <CategoryPage
              Search={Search}
              handleAddToCart={handleAddToCart}
              setSearch={setSearch}
              setOpen={setOpen}
              setSelectedProduct={setSelectedProduct}
              setSelectedImage={setSelectedImage}
              getImageUrl={getImageUrl}
            />
          }
        />

        <Route path="/admin" element={<Adminpage />}>
          <Route index element={<AdminDashboard />} />
          <Route path="product/add" element={<AddProduct />} />
          <Route path="product/get" element={<GetProduct />} />
          <Route path="product/update/:id" element={<UpdateProduct />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/pending" element={<AdminOrders />} />
          <Route path="orders/shipped" element={<AdminOrders />} />
          <Route path="orders/delivered" element={<AdminOrders />} />
        </Route>
        <Route path="/Cart" element={<Cart setAdded={setAdded} />} />
        <Route
          path="/like"
          element={
            <Like
              setOpen={setOpen}
              setSelectedProduct={setSelectedProduct}
              setSelectedImage={setSelectedImage}
              getImageUrl={getImageUrl}
              handleAddToCart={handleAddToCart}
            />
          }
        />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />

      </Routes>

      {open && selectedProduct && (
        // 🔑 FIX 2: overlay khud scrollable hai (mobile ke liye safety net),
        // taaki chhoti screens par modal kabhi cut na ho
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 overflow-y-auto">
          <div className="relative w-full max-w-6xl my-auto rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh]">

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100"
            >
              ✕
            </button>

            {/* 🔑 FIX 2: fixed pixel heights hata kar max-h-[90vh] + internal scroll diya */}
            <div className="flex flex-col lg:flex-row max-h-[90vh]">

              {/* ================= IMAGE SECTION ================= */}

              <div className="w-full lg:w-1/2 bg-gray-100 p-5 flex flex-col items-center justify-center lg:overflow-y-auto lg:max-h-[90vh]">

                <img
                  src={selectedImage}
                  alt={selectedProduct.name}
                  className="max-h-[35vh] sm:max-h-[45vh] lg:max-h-[60vh] w-full object-contain"
                />

                {/* Thumbnails */}

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {selectedProduct.image.map((img, index) => {
                    const url = getImageUrl(img);

                    return (
                      <img
                        key={index}
                        src={url}
                        onClick={() => setSelectedImage(url)}
                        className={`h-16 w-16 rounded-xl object-cover cursor-pointer border-2 transition-all duration-200 hover:scale-105
                  ${selectedImage === url
                            ? "border-black"
                            : "border-gray-300"
                          }`}
                      />
                    );
                  })}
                </div>

              </div>

              {/* ================= DETAILS ================= */}

              <div className="w-full lg:w-1/2 overflow-y-auto lg:max-h-[90vh] p-4 lg:p-10">

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {selectedProduct.name}
                </h1>

                <p className="mt-0 text-gray-600 leading-7">
                  {selectedProduct.description}
                </p>

                <div className="mt-2 flex items-center flex-wrap gap-3">
                  <h2 className="text-4xl font-bold text-green-600">
                    ₹{selectedProduct.price}
                  </h2>
                  {selectedProduct.old && selectedProduct.old > selectedProduct.price && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{selectedProduct.old}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-[#d4af37]/10 text-[#a9821f] text-xs font-bold">
                        {Math.round(100 - (selectedProduct.price / selectedProduct.old) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Status */}

                <div className="mt-4">
                  <span
                    className={`rounded-full px-5 py-2 text-sm font-semibold ${selectedProduct.status === "Available"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {selectedProduct.status}
                  </span>
                </div>

                {/* Sizes */}

                <div className="mt-8">

                  <h3 className="mb-3 text-lg font-semibold">
                    Select Size
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {selectedProduct.sizes?.length ? (
                      selectedProduct.sizes.map((size, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setselectedsize(size);
                            // 🔑 size badalne par colour reset karo (har size ke colours/quantity alag ho sakte hain)
                            const colours = getColoursForSize(selectedProduct, size);
                            setselectedcolour(colours[0]?.colour || "");
                          }}
                          className={`flex h-12 min-w-[52px] items-center justify-center rounded-lg border  px-4 font-semibold transition ${selectedsize === size ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:bg-black hover:text-white"}`}
                        >
                          {size}
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-500">
                        No Sizes Available
                      </span>
                    )}

                  </div>

                </div>

                {/* Colours — 🔑 ab size-specific colours dikhenge, quantity ke saath */}

                <div className="mt-8">

                  <h3 className="mb-3 text-lg font-semibold">
                    Select Colour
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {modalColours.length ? (
                      modalColours.map((c, index) => {
                        const colourOut = c.quantity === 0;
                        return (
                          <span
                            key={index}
                            title={colourOut ? `${c.colour} (Out of stock)` : c.colour}
                            onClick={() => { if (!colourOut) setselectedcolour(c.colour); }}
                            className={`h-9 w-9 rounded-full transition-all duration-200 border-2 ${colourOut ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:scale-110"} ${selectedcolour === c.colour
                              ? "border-black ring-2 ring-black ring-offset-2"
                              : "border-gray-300"
                              }`}
                            style={{ backgroundColor: getColourHex(c.colour) }}
                          ></span>
                        );
                      })
                    ) : (
                      <span className="text-gray-500">
                        No Colour Available
                      </span>
                    )}

                  </div>

                  {/* 🔑 Stock quantity dikhana */}
                  {selectedProduct.status !== "Unavailable" && selectedcolour && (
                    <div className="mt-3">
                      {modalQty === 0 ? (
                        <span className="text-sm font-semibold text-red-600">
                          Out of Stock
                        </span>
                      ) : modalQty <= 5 ? (
                        <span className="text-sm font-semibold text-orange-500">
                          Only {modalQty} left in stock!
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-500">
                          {modalQty} in stock
                        </span>
                      )}
                    </div>
                  )}

                </div>

                {/* Add To Cart */}

                <button
                  onClick={() => { if (!modalOutOfStock) { handleAddToCart(selectedProduct, selectedsize, selectedcolour) } }}
                  disabled={modalOutOfStock}
                  className={`mt-10 w-full rounded-xl py-4 text-lg font-semibold transition-all duration-300 ${modalOutOfStock
                    ? "cursor-not-allowed bg-gray-400 text-white"
                    : "bg-black text-white hover:bg-yellow-500 hover:text-black"
                    }`}
                >
                  {modalOutOfStock
                    ? "Out Of Stock"
                    : "Add To Cart"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}