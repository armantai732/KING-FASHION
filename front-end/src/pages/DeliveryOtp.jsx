import React, { useEffect, useRef, useState } from "react";
import { Mail, Hash, ShieldCheck, PackageCheck, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { RequestDeliveryOtp, VerifyDeliveryOtp } from "../data/api";

const RESEND_COOLDOWN = 60; // seconds, must match backend cooldown

export default function DeliveryOtp() {
  const [form, setForm] = useState({ orderId: "", email: "" });
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("request"); // "request" | "verify" | "done"
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.orderId.trim() || !form.email.trim()) {
      toast.error("Please enter both your Order ID and email");
      return;
    }

    try {
      setSending(true);
      const res = await RequestDeliveryOtp({
        orderId: form.orderId.trim(),
        email: form.email.trim(),
      });

      if (res.status) {
        toast.success(res.message || "OTP sent to your email");
        setStage("verify");
        startCooldown();
      } else {
        toast.error(res.message || "Could not send OTP");
      }
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    try {
      setVerifying(true);
      const res = await VerifyDeliveryOtp({
        orderId: form.orderId.trim(),
        email: form.email.trim(),
        otp,
      });

      if (res.status) {
        toast.success(res.message || "Delivery confirmed!");
        setStage("done");
      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold tracking-widest">
            KING<span className="text-[#d4af37]">.</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            {stage === "request" &&
              "Confirm delivery of your order with a one-time code — no login needed"}
            {stage === "verify" && "Enter the OTP we just emailed you to confirm delivery"}
            {stage === "done" && "Your order is confirmed as delivered"}
          </p>
        </div>

        {stage === "request" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="orderId"
                placeholder="Order ID"
                value={form.orderId}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>

            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email used for this order"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3 rounded-lg font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition-colors duration-300 disabled:opacity-60"
            >
              {sending && <Loader2 size={18} className="animate-spin" />}
              {sending ? "Sending..." : "Process"}
            </button>

            <p className="text-center text-xs text-gray-400 mt-2">
              You'll find your Order ID in the confirmation email we sent you, or under "My Orders".
            </p>
          </form>
        )}

        {stage === "verify" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg pl-10 pr-4 py-3 text-sm cursor-not-allowed"
              />
            </div>

            <div className="relative">
              <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                maxLength={6}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3 rounded-lg font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition-colors duration-300 disabled:opacity-60"
            >
              {verifying && <Loader2 size={18} className="animate-spin" />}
              {verifying ? "Verifying..." : "Confirm Delivery"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Didn't get the code?{" "}
              <button
                type="button"
                disabled={cooldown > 0 || sending}
                onClick={async () => {
                  setSending(true);
                  try {
                    const res = await RequestDeliveryOtp({
                      orderId: form.orderId.trim(),
                      email: form.email.trim(),
                    });
                    if (res.status) {
                      toast.success("OTP resent to your email");
                      startCooldown();
                    } else {
                      toast.error(res.message || "Could not resend OTP");
                    }
                  } finally {
                    setSending(false);
                  }
                }}
                className="text-[#d4af37] font-semibold hover:underline disabled:text-gray-300 disabled:no-underline disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </p>

            <p className="text-center text-xs text-gray-400">
              Never share this OTP with anyone — not even someone claiming to be from our delivery team.
            </p>
          </form>
        )}

        {stage === "done" && (
          <div className="text-center py-4">
            <PackageCheck size={56} className="mx-auto text-green-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Delivered!</h2>
            <p className="text-gray-500 text-sm mt-2">
              Order <span className="font-semibold">#{form.orderId}</span> has been marked as delivered.
              Thanks for shopping with King Fashion Viramgam.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
