import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] py-14 px-[5%]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Privacy Policy</h1>

        <div className="space-y-5 text-gray-600 leading-7 text-sm">
          <p>
            This Privacy Policy explains how KING Fashion Viramgam ("we", "us")
            collects, uses and protects the information you share with us
            when you use this website.
          </p>

          <div>
            <h2 className="text-gray-900 font-semibold mb-1">Information We Collect</h2>
            <p>
              When you create an account, place an order, or contact us, we
              collect information such as your name, email address, phone
              number and shipping address.
            </p>
          </div>

          <div>
            <h2 className="text-gray-900 font-semibold mb-1">How We Use Your Information</h2>
            <p>
              We use your information to process orders, communicate order
              and delivery updates, and improve our products and services.
              We never sell your personal information to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-gray-900 font-semibold mb-1">Payment Information</h2>
            <p>
              Online payments are processed securely through Razorpay. We do
              not store your card, UPI or bank details on our servers.
            </p>
          </div>

          <div>
            <h2 className="text-gray-900 font-semibold mb-1">Contact Us</h2>
            <p>
              If you have any questions about this policy, reach us at{" "}
              <a href="mailto:support@king.com" className="text-[#d4af37] font-semibold hover:underline">
                support@king.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
