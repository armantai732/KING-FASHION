import React from "react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] py-14 px-[5%]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Terms & Conditions</h1>

        <div className="space-y-5 text-gray-600 leading-7 text-sm">
          <div>
            <h2 className="text-gray-900 font-semibold mb-1">Orders & Payment</h2>
            <p>
              By placing an order on this website, you confirm that the
              details you've provided are accurate. Orders can be paid for
              via Cash on Delivery or online payment (UPI / Card / Netbanking)
              through Razorpay.
            </p>
          </div>

          <div>
            <h2 className="text-gray-900 font-semibold mb-1">Shipping</h2>
            <p>
              Orders are shipped to the address provided at checkout.
              Delivery timelines are shared once an order moves to the
              "Shipping" status and may vary by location.
            </p>
          </div>

          <div>
            <h2 className="text-gray-900 font-semibold mb-1">Cancellations & Returns</h2>
            <p>
              Orders that have not yet been shipped may be cancelled by
              contacting our support team. Please reach out as soon as
              possible after placing an order if you need to cancel.
            </p>
          </div>

          <div>
            <h2 className="text-gray-900 font-semibold mb-1">Pricing</h2>
            <p>
              Prices are listed in Indian Rupees (₹) and are subject to
              change without prior notice. Discounts shown are based on the
              product's listed original price (MRP).
            </p>
          </div>

          <div>
            <h2 className="text-gray-900 font-semibold mb-1">Contact</h2>
            <p>
              For any questions about these terms, contact us at{" "}
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
