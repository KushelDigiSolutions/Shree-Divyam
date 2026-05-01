"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Phone, Mail, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Real-time input filtering (Prevent entering invalid characters)
    if (name === "name") {
      const filteredValue = value.replace(/[^A-Za-z\s]/g, "").slice(0, 30);
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else if (name === "phone") {
      const filteredValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: false, success: false, error: "" });

    // Proper Validation on Submit
    const errors = [];
    
    const nameRegex = /^[A-Za-z\s]{2,}$/;
    if (!nameRegex.test(formData.name.trim())) {
      errors.push("Name should only contain letters and be at least 2 characters long.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address.");
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      errors.push("Please enter a valid 10-digit phone number.");
    }

    if (formData.message.trim().length < 10) {
      errors.push("Message must be at least 10 characters long.");
    }

    if (errors.length > 0) {
      setStatus({ loading: false, success: false, error: errors[0] }); // Show first error
      return;
    }

    setStatus({ loading: true, success: false, error: "" });

    try {
      const res = await fetch("https://shreedivyam.kdscrm.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ loading: false, success: true, error: "" });
        setFormData({ name: "", email: "", phone: "", message: "" });
        // Clear success message after 5 seconds
        setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
      } else {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Contact Form Error:", err);
      setStatus({ loading: false, success: false, error: err.message || "Connection failed. Please check your internet." });
    }
  };

  return (
    <main className="bg-[#FDFBF9] min-h-screen flex flex-col">
      <Header />

      <section className="flex-1 mx-auto w-full max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Left Side: Contact Info */}
          <div className="space-y-8 md:space-y-12">
            <div>
              <h1 className="text-[32px] sm:text-[44px] md:text-[54px] font-playfair font-bold text-[#303030] leading-tight">
                Get in Touch
              </h1>
              <p className="mt-4 text-[16px] md:text-[18px] text-gray-600 font-gt-walsheim max-w-[500px] leading-relaxed">
                Have questions about our collection or need help with an order? Our team is here to provide you with the royal service you deserve.
              </p>
            </div>

            <div className="space-y-6 md:space-y-8">
              <a href="tel:+918595046368" className="flex items-start gap-5 group cursor-pointer">
                <div className="bg-white p-3.5 rounded-full shadow-sm border border-gray-100 text-[#7A1F3D] group-hover:bg-[#7A1F3D] group-hover:text-white transition-all">
                  <Phone size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#303030] text-[16px] sm:text-[18px] mb-1">Call Us</h3>
                  <span className="text-gray-600 group-hover:text-[#7A1F3D] transition-colors">+91 8595046368</span>
                </div>
              </a>

              <a href="mailto:info@shreedivyam.com" className="flex items-start gap-5 group cursor-pointer">
                <div className="bg-white p-3.5 rounded-full shadow-sm border border-gray-100 text-[#7A1F3D] group-hover:bg-[#7A1F3D] group-hover:text-white transition-all">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#303030] text-[16px] sm:text-[18px] mb-1">Email Us</h3>
                  <span className="text-gray-600 group-hover:text-[#7A1F3D] transition-colors">info@shreedivyam.com</span>
                </div>
              </a>

              <a href="https://www.google.com/maps/search/3891+Ranchview+Dr+Richardson+California+62639" target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 group cursor-pointer">
                <div className="bg-white p-3.5 rounded-full shadow-sm border border-gray-100 text-[#7A1F3D] group-hover:bg-[#7A1F3D] group-hover:text-white transition-all">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#303030] text-[16px] sm:text-[18px] mb-1">Visit Us</h3>
                  <span className="text-gray-600 group-hover:text-[#7A1F3D] transition-colors leading-relaxed block max-w-[300px]">
                    3891 Ranchview Dr. Richardson,<br />
                    California 62639
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-white p-6 sm:p-10 md:p-12 rounded-sm shadow-xl shadow-gray-200/50 border border-gray-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7A1F3D]/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
            
            <h2 className="text-[24px] sm:text-[28px] font-playfair font-bold text-[#303030] mb-8">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-[12px] uppercase tracking-widest font-bold text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full h-12 px-4 border border-gray-200 rounded-sm focus:border-[#7A1F3D] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-widest font-bold text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@mail.com"
                    className="w-full h-12 px-4 border border-gray-200 rounded-sm focus:border-[#7A1F3D] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-widest font-bold text-gray-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full h-12 px-4 border border-gray-200 rounded-sm focus:border-[#7A1F3D] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-widest font-bold text-gray-400 mb-2">Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you today?"
                  className="w-full p-4 border border-gray-200 rounded-sm focus:border-[#7A1F3D] outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className={`w-full h-14 bg-[#7A1F3D] text-white font-bold uppercase tracking-widest flex items-center justify-center gap-3 rounded-sm transition-all hover:bg-[#5D172E] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {status.loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>

              {status.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 border border-green-100 rounded-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 size={20} />
                  <span className="font-medium">Thank you! Your message has been sent successfully.</span>
                </div>
              )}

              {status.error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="font-medium">{status.error}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
