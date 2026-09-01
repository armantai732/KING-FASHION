import React, { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { toast } from "react-toastify";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const subject = encodeURIComponent(`Message from ${name} — King Fashion website`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);

    // opens the visitor's own email app with everything pre-filled
    window.location.href = `mailto:support@king.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] py-14 px-[5%]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">
          Get In <span className="text-[#d4af37]">Touch</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <a href="https://maps.google.com/?q=Ahmedabad,Gujarat,India" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-[#d4af37] transition">
              <MapPin size={18} /> Ahmedabad, Gujarat, India
            </a>
            <a href="tel:+919876543210" className="flex items-center gap-3 text-gray-700 hover:text-[#d4af37] transition">
              <Phone size={18} /> +91 98765 43210
            </a>
            <a href="mailto:support@king.com" className="flex items-center gap-3 text-gray-700 hover:text-[#d4af37] transition">
              <Mail size={18} /> support@king.com
            </a>
          </div>

          <form onSubmit={handleSend} className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your Message"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] resize-none"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#1a1a1a] text-white font-semibold hover:bg-[#d4af37] hover:text-[#1a1a1a] transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
