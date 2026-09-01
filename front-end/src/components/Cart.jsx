import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Minus,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ShoppingBag,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Package,
  Clock,
  XCircle,
} from "lucide-react";
import {
  GetCart,
  UpdateCartItem,
  DeleteCartItem,
  PlaceOrder,
  GetSavedAddress,
  GetMyOrders,
  CancelOrder,
} from "../data/api";
import { getColourHex } from "../utils/colourMap";

const FREE_SHIPPING_ABOVE = 999;
const SHIPPING_FEE = 79;

// simple helper to build the full image url
function getImageUrl(img) {
  if (!img) {
    return "";
  }
  if (img.startsWith("http")) {
    return img;
  }
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  return apiUrl + "/uploads/" + img.replace(/^uploads[\\/]/, "");
}

export default function Cart({ setAdded }) {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // which tab is active on this page: "cart" or "orders"
  const [view, setView] = useState("cart");
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  // this stores the _id of the item that is currently being updated,
  // so we can disable just that item's buttons instead of the whole page
  const [updatingId, setUpdatingId] = useState(null);

  // checkout popup steps
  // 0 = closed, 1 = review order, 2 = address, 3 = payment, 4 = order placed
  const [step, setStep] = useState(0);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // order cancellation popup: holds the order being cancelled, the reason
  // text, and whether the cancel request is currently in flight
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // load the cart when the page opens
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/Login");
      return;
    }
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    const res = await GetCart();

    if (res && res.status) {
      setCartItems(res.cart || []);
      if (setAdded) {
        setAdded(res.cart ? res.cart.length : 0);
      }
    } else {
      toast.error((res && res.message) || "Could not load your cart");
    }

    setLoading(false);
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    const res = await GetMyOrders();

    if (res && res.status) {
      setMyOrders(res.orders || []);
    } else {
      toast.error((res && res.message) || "Could not load your orders");
    }

    setOrdersLoading(false);
    setOrdersLoaded(true);
  };

  const switchToOrders = () => {
    setView("orders");
    if (!ordersLoaded) {
      loadOrders();
    }
  };

  const orderStatusStyle = (status) => {
    if (status === "Pending" || status === "Processing") {
      return "bg-yellow-100 text-yellow-700";
    }
    if (status === "Shipping") {
      return "bg-blue-100 text-blue-700";
    }
    if (status === "Delivered") {
      return "bg-green-100 text-green-700";
    }
    if (status === "Rejected" || status === "Cancelled") {
      return "bg-red-100 text-red-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const orderStatusIcon = (status) => {
    if (status === "Pending" || status === "Processing") {
      return <Clock size={14} />;
    }
    if (status === "Shipping") {
      return <Truck size={14} />;
    }
    if (status === "Delivered") {
      return <CheckCircle2 size={14} />;
    }
    if (status === "Rejected" || status === "Cancelled") {
      return <XCircle size={14} />;
    }
    return null;
  };

  // an order can only be cancelled by the customer while it hasn't
  // shipped yet
  const canCancelOrder = (status) => status === "Pending" || status === "Processing";

  const openCancelOrder = (order) => {
    setCancelOrderTarget(order);
    setCancelReason("");
  };

  const closeCancelOrder = () => {
    if (cancelling) return;
    setCancelOrderTarget(null);
    setCancelReason("");
  };

  const confirmCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please tell us why you're cancelling this order");
      return;
    }

    setCancelling(true);
    const res = await CancelOrder(cancelOrderTarget._id, cancelReason.trim());
    setCancelling(false);

    if (res && res.status) {
      setMyOrders((prev) =>
        prev.map((o) => (o._id === cancelOrderTarget._id ? res.order : o))
      );
      toast.success("Order cancelled");
      setCancelOrderTarget(null);
      setCancelReason("");
    } else {
      toast.error((res && res.message) || "Could not cancel order");
    }
  };

  // calculate totals with a simple loop instead of fancy reduce chains
  let itemsTotal = 0;
  for (let i = 0; i < cartItems.length; i++) {
    itemsTotal = itemsTotal + cartItems[i].price * cartItems[i].quantity;
  }

  let shippingFee = 0;
  if (itemsTotal > 0 && itemsTotal < FREE_SHIPPING_ABOVE) {
    shippingFee = SHIPPING_FEE;
  }

  const totalAmount = itemsTotal + shippingFee;

  const increaseQty = (item) => {
    updateQuantity(item, item.quantity + 1);
  };

  const decreaseQty = (item) => {
    if (item.quantity <= 1) {
      return;
    }
    updateQuantity(item, item.quantity - 1);
  };

  const updateQuantity = async (item, newQty) => {
    setUpdatingId(item._id);

    const res = await UpdateCartItem(item._id, newQty);

    if (res && res.status) {
      // update just this one item in the list
      const updatedList = cartItems.map((ci) => {
        if (ci._id === item._id) {
          return { ...ci, quantity: newQty };
        }
        return ci;
      });
      setCartItems(updatedList);
    } else {
      toast.error((res && res.message) || "Could not update quantity");
    }

    setUpdatingId(null);
  };

  const removeItem = async (item) => {
    setUpdatingId(item._id);

    const res = await DeleteCartItem(item._id);

    if (res && res.status) {
      const updatedList = cartItems.filter((ci) => ci._id !== item._id);
      setCartItems(updatedList);
      if (setAdded) {
        setAdded(updatedList.length);
      }
      toast.success("Item removed from cart");
    } else {
      toast.error((res && res.message) || "Could not remove item");
    }

    setUpdatingId(null);
  };

  const openCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setStep(1);

    // try to prefill the address from the last order, if any
    const res = await GetSavedAddress();
    if (res && res.status && res.address) {
      setFullName(res.address.fullName || "");
      setPhone(res.address.phone || "");
      setAddressLine(res.address.addressLine || "");
      setCity(res.address.city || "");
      setState(res.address.state || "");
      setPincode(res.address.pincode || "");
      setCountry(res.address.country || "India");
    }
  };

  const closeCheckout = () => {
    setStep(0);
    setPlacedOrder(null);
  };

  const goToPaymentStep = () => {
    if (!fullName.trim() || !phone.trim() || !addressLine.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      toast.error("Please fill in all address fields");
      return;
    }

    if (phone.trim().length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    if (pincode.trim().length < 4 || pincode.trim().length > 6) {
      toast.error("Enter a valid pincode");
      return;
    }

    setStep(3);
  };

  // NOTE: Online payment gateway (Razorpay) is not wired up. Whichever
  // option the user picks (COD or Online), the order is placed as a
  // plain Cash on Delivery order — no real online payment is taken.
  const handlePlaceOrder = async () => {
    if (placingOrder) {
      return;
    }

    setPlacingOrder(true);

    const cartItemIds = [];
    for (let i = 0; i < cartItems.length; i++) {
      cartItemIds.push(cartItems[i]._id);
    }

    const res = await PlaceOrder({
      address: {
        fullName,
        phone,
        addressLine,
        city,
        state,
        pincode,
        country,
      },
      paymentMethod: "COD",
      cartItemIds,
    });

    setPlacingOrder(false);

    if (res && res.status) {
      setPlacedOrder(res.order);
      setCartItems([]);
      if (setAdded) {
        setAdded(0);
      }
      setStep(4);
      toast.success("Order placed successfully!");
    } else {
      toast.error((res && res.message) || "Could not place order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:py-10 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-1.5 sm:px-5 sm:py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#d4af37] hover:text-[#1a1a1a] transition text-sm sm:text-base"
        >
          ← Continue Shopping
        </button>

        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
          Your Cart
        </h1>

        {/* Tabs: My Cart / My Orders */}
        <div className="flex gap-2 mb-6 sm:mb-8">
          <button
            onClick={() => setView("cart")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${view === "cart"
                ? "bg-[#1a1a1a] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
          >
            <ShoppingBag size={15} className="inline mr-1.5 -mt-0.5" />
            My Cart
          </button>
          <button
            onClick={switchToOrders}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${view === "orders"
                ? "bg-[#1a1a1a] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
          >
            <Package size={15} className="inline mr-1.5 -mt-0.5" />
            My Orders
          </button>
        </div>

        {view === "cart" && cartItems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <ShoppingBag className="mx-auto mb-4 text-gray-300" size={56} />
            <h2 className="text-xl font-semibold text-gray-600">Your cart is empty</h2>
            <p className="text-gray-400 mt-2">Add something you love to get started.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-3 bg-[#1a1a1a] text-white rounded-xl font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition"
            >
              Browse Products
            </button>
          </div>
        )}

        {view === "cart" && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart items list */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.product || {};
                const image = product.image && product.image[0] ? getImageUrl(product.image[0]) : "";

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm p-3 sm:p-4 flex gap-3 sm:gap-4"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="h-20 w-20 sm:h-28 sm:w-28 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {product.name || "Product"}
                        </h3>
                        <button
                          onClick={() => removeItem(item)}
                          disabled={updatingId === item._id}
                          className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                          Size: {item.size}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full flex items-center gap-1">
                          <span
                            className="h-3 w-3 rounded-full border border-gray-300 inline-block"
                            style={{ backgroundColor: getColourHex(item.colour) }}
                          ></span>
                          {item.colour}
                        </span>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => decreaseQty(item)}
                            disabled={updatingId === item._id || item.quantity <= 1}
                            className="px-2 py-1.5 hover:bg-gray-100 disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => increaseQty(item)}
                            disabled={updatingId === item._id}
                            className="px-2 py-1.5 hover:bg-gray-100 disabled:opacity-40"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-400">₹{item.price} each</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary + checkout button */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Items Total</span>
                    <span>₹{itemsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? "Free" : "₹" + shippingFee}</span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-xs text-gray-400">
                      Add ₹{(FREE_SHIPPING_ABOVE - itemsTotal).toLocaleString()} more for free shipping
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>

                <button
                  onClick={openCheckout}
                  className="mt-6 w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition-all duration-300"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Orders tab content */}
        {view === "orders" && (
          <div>
            {ordersLoading && (
              <p className="text-gray-500 text-center py-10">Loading your orders...</p>
            )}

            {!ordersLoading && myOrders.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <Package className="mx-auto mb-4 text-gray-300" size={56} />
                <h2 className="text-xl font-semibold text-gray-600">No orders yet</h2>
                <p className="text-gray-400 mt-2">Your placed orders will show up here.</p>
              </div>
            )}

            {!ordersLoading && myOrders.length > 0 && (
              <div className="space-y-4">
                {myOrders.map((order) => (
                  <div key={order._id} className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Order ID</p>
                        <p className="font-mono text-xs text-gray-600">{order._id}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${orderStatusStyle(order.status)}`}
                      >
                        {orderStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3">
                      {order.items.map((it, idx) => (
                        <p key={idx} className="text-sm text-gray-600">
                          {it.name} — {it.size} · {it.colour} · Qty {it.quantity}
                        </p>
                      ))}
                    </div>

                    {order.status === "Shipping" && order.expectedDeliveryDate && (
                      <p className="text-xs text-blue-600 mb-2">
                        Expected delivery by {new Date(order.expectedDeliveryDate).toDateString()}
                      </p>
                    )}

                    {order.status === "Cancelled" && order.cancelReason && (
                      <p className="text-xs text-red-500 mb-2">
                        Cancelled: {order.cancelReason}
                      </p>
                    )}

                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-400">
                        Placed on {new Date(order.createdAt).toDateString()}
                      </p>
                      <p className="font-bold text-gray-900">
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                    </div>

                    {canCancelOrder(order.status) && (
                      <div className="pt-3">
                        <button
                          onClick={() => openCancelOrder(order)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <XCircle size={13} />
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= CHECKOUT POPUP (bottom sheet) ================= */}
      {step > 0 && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                {step > 1 && step < 4 && (
                  <button onClick={() => setStep(step - 1)} className="text-gray-400 hover:text-black">
                    <ChevronLeft size={20} />
                  </button>
                )}

                {step === 1 && <h2 className="text-lg font-bold text-gray-900">Review Order</h2>}
                {step === 2 && <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>}
                {step === 3 && <h2 className="text-lg font-bold text-gray-900">Payment</h2>}
                {step === 4 && <h2 className="text-lg font-bold text-gray-900">Order Confirmed</h2>}
              </div>
              <button onClick={closeCheckout} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            {/* Step progress bar */}
            {step < 4 && (
              <div className="flex gap-2 px-5 pt-4 flex-shrink-0">
                <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-[#d4af37]" : "bg-gray-200"}`}></div>
                <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-[#d4af37]" : "bg-gray-200"}`}></div>
                <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-[#d4af37]" : "bg-gray-200"}`}></div>
              </div>
            )}

            <div className="overflow-y-auto p-5 flex-1">

              {/* STEP 1: Review items */}
              {step === 1 && (
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const product = item.product || {};
                    const image = product.image && product.image[0] ? getImageUrl(product.image[0]) : "";

                    return (
                      <div key={item._id} className="flex gap-3 items-center border-b border-gray-100 pb-3">
                        <img src={image} className="h-14 w-14 rounded-lg object-cover bg-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.size} · {item.colour} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-sm">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}

                  <div className="pt-2 space-y-1 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Items Total</span>
                      <span>₹{itemsTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span>{shippingFee === 0 ? "Free" : "₹" + shippingFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                      <span>Total</span>
                      <span>₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Address form */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Truck size={14} /> Where should we deliver your order?
                  </div>

                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    maxLength={10}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                  <textarea
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="House No, Street, Area"
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] resize-none"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                    <input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Pincode"
                      maxLength={6}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Payment method */}
              {step === 3 && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-1">Choose a payment method</p>

                  <label
                    className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${paymentMethod === "COD" ? "border-[#d4af37] bg-[#fff9ec]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="accent-[#d4af37]"
                    />
                    <Truck size={20} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Cash on Delivery</p>
                      <p className="text-xs text-gray-400">Pay when your order arrives</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${paymentMethod === "Online" ? "border-[#d4af37] bg-[#fff9ec]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === "Online"}
                      onChange={() => setPaymentMethod("Online")}
                      className="accent-[#d4af37]"
                    />
                    <ShieldCheck size={20} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Pay Online</p>
                      <p className="text-xs text-gray-400">Currently unavailable — order will be placed as Cash on Delivery</p>
                    </div>
                  </label>

                  <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
                    <span>Amount Payable</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* STEP 4: Order placed */}
              {step === 4 && placedOrder && (
                <div className="text-center py-4">
                  <CheckCircle2 className="mx-auto text-green-500 mb-3" size={56} />
                  <h3 className="text-xl font-bold text-gray-900">Thank you!</h3>
                  <p className="text-gray-500 mt-1">Your order has been placed successfully.</p>

                  <div className="bg-gray-50 rounded-xl p-4 mt-5 text-left text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order ID</span>
                      <span className="font-mono text-xs">{placedOrder._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment</span>
                      <span>{placedOrder.paymentMethod} · {placedOrder.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1">
                      <span>Total Paid</span>
                      <span>₹{placedOrder.totalAmount ? placedOrder.totalAmount.toLocaleString() : 0}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      closeCheckout();
                      navigate("/");
                    }}
                    className="mt-6 w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            {step === 1 && (
              <div className="p-5 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition"
                >
                  Continue to Address
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="p-5 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={goToPaymentStep}
                  className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="p-5 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => handlePlaceOrder()}
                  disabled={placingOrder}
                  className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition disabled:opacity-60"
                >
                  {placingOrder
                    ? "Placing Order..."
                    : "Place Order · ₹" + totalAmount.toLocaleString()}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CANCEL ORDER POPUP ================= */}
      {cancelOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Cancel Order</h2>
              <button onClick={closeCancelOrder} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-500">
                Please let us know why you're cancelling this order.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Ordered by mistake, found a better price, changed my mind..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] resize-none"
              />
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeCancelOrder}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition disabled:opacity-60"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}