import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, ShieldCheck, KeyRound } from "lucide-react";
import { LoginData, RegisterData, VerifyOtp, ResendOtp, RequestPasswordReset, ResetPassword } from "../data/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", secretKey: "" });

  // forgot password flow
  const [forgotMode, setForgotMode] = useState(false); // true whenever the forgot-password screens are showing
  const [forgotStep, setForgotStep] = useState("request"); // "request" -> "reset"
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      const res = await RegisterData(form);
      if (!res.status) {
        toast.error(res.message);
        if (res.message === "User Already Register! first Login.") {
          setIsRegister(false)
        }
        return;
      } else {
        toast.success("OTP sent to your email");
      }



      setForm((prev) => ({
        ...prev,
        name: "",
        password: "",
        role: "user",
        secretKey: "",
      }));

      setIsOpen(false);
      setSentOtp(true); // ab OTP screen dikhega
    } else {
      const res = await LoginData(form);
      if (!res.status) {
        toast.error(res.message);

        // account exists but email was never verified — send a fresh OTP
        // and take the user straight to the verification screen.
        if (res.needsVerification) {
          const resendRes = await ResendOtp({ email: form.email });
          if (resendRes?.status) {
            toast.success("OTP sent to your email. Please verify to continue.");
          }
          setSentOtp(true);
        }
        return;
      } else {
        toast.success("Logged in successfully!");
        if (res.status) {
          const token = localStorage.setItem("token", res.token)
        }
        {
          res.role === "admin" ? navigate("/admin") : navigate("/");
        }

        setForm({
          name: "",
          email: "",
          password: "",
          role: "user",
          secretKey: "",
        });
      }
    }
  };

  // NEW: OTP verify submit
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      setOtpLoading(true);
      const res = await VerifyOtp({ email: form.email, otp });

      if (res.status === true) {
        toast.success("Account verified successfully");
        setForm({
          name: "",
          email: "",
          password: "",
          role: "user",
          secretKey: "",
        });
        setOtp("");
        setSentOtp(false);
        setIsRegister(false);
      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  // STEP 1 — request the OTP for a forgotten password
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }
    try {
      setForgotLoading(true);
      const res = await RequestPasswordReset({ email: forgotEmail });
      if (res.status) {
        toast.success(res.message || "OTP sent to your email");
        setForgotStep("reset");
      } else {
        toast.error(res.message || "Could not send OTP");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // STEP 2 — verify OTP + set the new password in a single step
  const handleForgotReset = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !newPassword) {
      toast.error("Please enter the OTP and your new password");
      return;
    }
    try {
      setForgotLoading(true);
      const res = await ResetPassword({ email: forgotEmail, otp: forgotOtp, newPassword });
      if (res.status) {
        toast.success(res.message || "Password reset successfully!");
        // back to normal login screen, ready to sign in with the new password
        setForgotMode(false);
        setForgotStep("request");
        setForgotEmail("");
        setForgotOtp("");
        setNewPassword("");
        setForm((prev) => ({ ...prev, email: forgotEmail, password: "" }));
      } else {
        toast.error(res.message || "Could not reset password");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  if (forgotMode) {
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
              {forgotStep === "request"
                ? "Enter your email to receive a reset OTP"
                : "Enter the OTP and your new password"}
            </p>
          </div>

          {forgotStep === "request" ? (
            <form onSubmit={handleForgotRequest} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition-colors duration-300 disabled:opacity-60"
              >
                {forgotLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotReset} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={forgotEmail}
                  disabled
                  className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg pl-10 pr-4 py-3 text-sm cursor-not-allowed"
                />
              </div>

              <div className="relative">
                <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors tracking-widest"
                />
              </div>

              <div className="relative">
                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition-colors duration-300 disabled:opacity-60"
              >
                {forgotLoading ? "Resetting..." : "Reset Password"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Didn't get the code?{" "}
                <button
                  type="button"
                  onClick={async () => {
                    const res = await RequestPasswordReset({ email: forgotEmail });
                    if (res.status) {
                      toast.success("OTP resent to your email");
                    } else {
                      toast.error(res.message || "Could not resend OTP");
                    }
                  }}
                  className="text-[#d4af37] font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </p>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Remembered your password?{" "}
            <button
              onClick={() => {
                setForgotMode(false);
                setForgotStep("request");
                setForgotOtp("");
                setNewPassword("");
              }}
              className="text-[#d4af37] font-semibold hover:underline"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    );
  }

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
            {sentOtp
              ? "Verify your email to finish creating your account"
              : isRegister
                ? "Create your account"
                : "Welcome back, please login"}
          </p>
        </div>

        {/* NEW: register ke baad OTP verification screen */}
        {sentOtp ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                disabled
                className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg pl-10 pr-4 py-3 text-sm cursor-not-allowed"
              />
            </div>

            <div className="relative">
              <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={otpLoading}
              className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition-colors duration-300 disabled:opacity-60"
            >
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Didn't get the code?{" "}
              <button
                type="button"
                onClick={async () => {
                  const res = await ResendOtp({ email: form.email });
                  if (res.status) {
                    toast.success("OTP resent to your email");
                  } else {
                    toast.error(res.message || "Could not resend OTP");
                  }
                }}
                className="text-[#d4af37] font-semibold hover:underline"
              >
                Resend OTP
              </button>
            </p>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!isRegister && (
                <div className="flex justify-between items-center text-sm">
                  <label className="flex items-center gap-2 text-gray-500">
                    <input type="checkbox" className="accent-[#d4af37]" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(form.email || "");
                      setForgotMode(true);
                    }}
                    className="text-[#d4af37] font-medium hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {isRegister && (
                <div className="flex justify-center gap-3 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setForm({ ...form, role: "user" });
                    }}
                    className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${!isOpen ? "bg-[#d4af37] text-black" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    User
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(true);
                      setForm({ ...form, role: "admin" });
                    }}
                    className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${isOpen ? "bg-[#d4af37] text-black" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    Admin
                  </button>
                </div>
              )}

              {isOpen && (
                <div className="relative mt-4">
                  <input
                    type="text"
                    name="secretKey"
                    value={form.secretKey}
                    onChange={handleChange}
                    placeholder="Enter Secret Key"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition-colors duration-300"
              >
                {isRegister ? "Create Account" : "Login"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-xs">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button className="w-full border border-gray-200 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#d4af37] font-semibold hover:underline"
              >
                {isRegister ? "Login" : "Sign Up"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}