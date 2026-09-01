import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
} from "lucide-react";
import { AdminGetOrders, AdminUpdateOrderStatus } from "../data/api";

// figure out the default status filter from the url the admin clicked
function getFilterFromPath(pathname) {
  if (pathname === "/admin/orders/pending") {
    return "Processing";
  }
  if (pathname === "/admin/orders/shipped") {
    return "Shipping";
  }
  if (pathname === "/admin/orders/delivered") {
    return "Delivered";
  }
  return ""; // "" means show all
}

function AdminOrders() {
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(getFilterFromPath(location.pathname));

  // the order currently being updated (for the shipping date popup)
  const [shippingOrderId, setShippingOrderId] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    setStatusFilter(getFilterFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    const res = await AdminGetOrders(statusFilter);

    if (res && res.status) {
      setOrders(res.orders || []);
    } else {
      toast.error((res && res.message) || "Could not load orders");
    }

    setLoading(false);
  };

  const changeStatus = async (order, newStatus, expectedDeliveryDate) => {
    setSavingId(order._id);

    const res = await AdminUpdateOrderStatus(order._id, newStatus, expectedDeliveryDate);

    if (res && res.status) {
      toast.success("Order status updated");
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? res.order : o))
      );
    } else {
      toast.error((res && res.message) || "Could not update order status");
    }

    setSavingId(null);
    setShippingOrderId(null);
    setDeliveryDate("");
  };

  const handleShippingClick = (order) => {
    setShippingOrderId(order._id);
    setDeliveryDate("");
  };

  const confirmShipping = (order) => {
    if (!deliveryDate) {
      toast.error("Please select an expected delivery date");
      return;
    }
    changeStatus(order, "Shipping", deliveryDate);
  };

  const statusBadge = (status) => {
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

  const filterButtons = [
    { label: "All", value: "" },
    { label: "Processing", value: "Processing" },
    { label: "Shipping", value: "Shipping" },
    { label: "Delivered", value: "Delivered" },
    { label: "Rejected", value: "Rejected" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Package className="text-blue-600" size={24} />
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setStatusFilter(btn.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === btn.value
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-500">Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-400">
          No orders found
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-slate-400">Order ID</p>
                <p className="font-mono text-xs text-slate-600">{order._id}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Placed on {new Date(order.createdAt).toDateString()}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(order.status)}`}
              >
                {order.status}
              </span>
            </div>

            {/* Customer info */}
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <User size={14} />
              {order.user ? `${order.user.name} (${order.user.email})` : "Unknown customer"}
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-sm text-slate-500 mb-3">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                {order.address.fullName}, {order.address.addressLine},{" "}
                {order.address.city}, {order.address.state} - {order.address.pincode},{" "}
                {order.address.country} · Phone: {order.address.phone}
              </span>
            </div>

            {/* Items */}
            <div className="border-t border-slate-100 pt-3 mb-3 space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-12 w-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                  />
                  <p className="text-sm text-slate-600">
                    {it.name} — {it.size} · {it.colour} · Qty {it.quantity} · ₹{it.price} each
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm text-slate-600 mb-3">
              <span>Payment: {order.paymentMethod} ({order.paymentStatus})</span>
              <span className="font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</span>
            </div>

            {order.status === "Shipping" && order.expectedDeliveryDate && (
              <p className="text-xs text-blue-600 mb-3">
                Expected delivery by {new Date(order.expectedDeliveryDate).toDateString()}
              </p>
            )}

            {order.status === "Cancelled" && order.cancelReason && (
              <p className="text-xs text-red-500 mb-3">
                Customer's reason for cancelling: {order.cancelReason}
              </p>
            )}

            {/* Admin actions */}
            {order.status === "Processing" && (
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                {shippingOrderId === order._id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={deliveryDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => confirmShipping(order)}
                      disabled={savingId === order._id}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShippingOrderId(null)}
                      className="px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleShippingClick(order)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                    >
                      <Truck size={14} />
                      Mark as Shipping
                    </button>
                    <button
                      onClick={() => changeStatus(order, "Rejected")}
                      disabled={savingId === order._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 disabled:opacity-60"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </>
                )}
              </div>
            )}

            {order.status === "Shipping" && (
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                {/* <button
                  onClick={() => changeStatus(order, "Delivered")}
                  disabled={savingId === order._id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                >
                  <CheckCircle2 size={14} />
                  Mark as Delivered
                </button> */}
                <button
                  onClick={() => changeStatus(order, "Rejected")}
                  disabled={savingId === order._id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 disabled:opacity-60"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOrders;
