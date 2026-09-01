import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Users,
  ShoppingBag,
} from "lucide-react";
import { AdminGetDashboard } from "../data/api";

function StatCard({ icon, label, value, tone }) {
  const toneClass =
    tone === "green"
      ? "bg-green-50 text-green-700"
      : tone === "red"
      ? "bg-red-50 text-red-700"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700"
      : tone === "yellow"
      ? "bg-yellow-50 text-yellow-700"
      : "bg-slate-50 text-slate-700";

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${toneClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const res = await AdminGetDashboard();

    if (res && res.status) {
      setStats(res.stats);
      setTopProducts(res.topProducts || []);
      setRecentOrders(res.recentOrders || []);
    } else {
      toast.error((res && res.message) || "Could not load dashboard");
    }

    setLoading(false);
  };

  const statusBadge = (status) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Shipping") return "bg-blue-100 text-blue-700";
    if (status === "Delivered") return "bg-green-100 text-green-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return <p className="text-slate-500">Loading dashboard...</p>;
  }

  if (!stats) {
    return <p className="text-slate-500">Could not load dashboard data.</p>;
  }

  const isProfit = stats.totalProfit >= 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {/* Money stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<IndianRupee size={22} />}
          label="Revenue (Delivered Orders)"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          tone="blue"
        />
        <StatCard
          icon={isProfit ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
          label={isProfit ? "Profit" : "Loss"}
          value={`₹${Math.abs(stats.totalProfit).toLocaleString()}`}
          tone={isProfit ? "green" : "red"}
        />
        <StatCard
          icon={<IndianRupee size={22} />}
          label="Purchase Cost"
          value={`₹${stats.totalCost.toLocaleString()}`}
          tone="yellow"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Pending / In-Transit Value"
          value={`₹${stats.pendingRevenue.toLocaleString()}`}
          tone="yellow"
        />
      </div>

      {/* Order counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Package size={20} />} label="Total Orders" value={stats.totalOrders} />
        <StatCard icon={<Clock size={20} />} label="Pending" value={stats.pendingCount} tone="yellow" />
        <StatCard icon={<Truck size={20} />} label="Shipping" value={stats.shippingCount} tone="blue" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Delivered" value={stats.deliveredCount} tone="green" />
      </div>

      {/* Other stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<XCircle size={20} />} label="Rejected Orders" value={stats.rejectedCount} tone="red" />
        <StatCard icon={<XCircle size={20} />} label="Cancelled Orders" value={stats.cancelledCount} tone="red" />
        <StatCard icon={<ShoppingBag size={20} />} label="Total Products" value={stats.totalProducts} />
        <StatCard icon={<Users size={20} />} label="Registered Users" value={stats.totalUsers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top selling products */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Top Selling Products</h2>

          {topProducts.length === 0 && (
            <p className="text-slate-400 text-sm">No delivered orders yet</p>
          )}

          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img
                  src={p.image}
                  className="h-12 w-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.quantitySold} sold</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  ₹{p.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Orders</h2>

          {recentOrders.length === 0 && (
            <p className="text-slate-400 text-sm">No orders yet</p>
          )}

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {order.user ? order.user.name : "Unknown customer"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-sm font-semibold text-slate-700">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;