"use client";

import { Phone, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useCurrency } from "../context/CurrencyContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* 🔴 Top Bar Wrapper */}
      <div className="mx-auto max-w-[1720px] bg-[#7A1F3D]">
        <div className="mx-auto max-w-[1440px] flex flex-col gap-3 px-4 sm:px-8 md:px-12 lg:px-24 py-3 md:flex-row md:items-center md:justify-between text-white text-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6 text-base w-full md:w-auto">
            <div className="flex items-center text-[16px] md:text-[18px] gap-2">
              <Phone size={18} className="md:w-[20px]" />
              <span>+91 8595046368</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end flex-wrap items-start gap-4 md:gap-6 text-[16px] md:text-[18px] w-full md:w-auto">
            <div className="relative w-full sm:w-48 md:w-64">
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-[0.30rem] border border-gray-300 bg-white px-4 pr-11 py-2 text-xs sm:text-sm text-gray-800 shadow-sm outline-none transition duration-150 focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#7A1F3D]/20"
              />
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A1F3D] z-10 md:w-[22px]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[15px] md:text-[18px]">
              <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer">
                <img src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856036/Mask_group_3_mw7ria.png" alt="account" className="h-4 md:h-5 w-auto" />
                <span>Account</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer">
                <img src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774855916/Mask_group_szptm7.png" alt="wishlist" className="h-4 md:h-5 w-auto" />
                <span>Wishlist</span>
              </div>
              <Link href="/cart" className="flex items-center gap-1.5 md:gap-2 cursor-pointer hover:text-white  transition-colors">
                <img src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774855916/Mask_group_2_zcgcsh.png" alt="bag" className="h-4 md:h-5 w-auto" />
                <span>My Bag</span>
              </Link>

              {/* 💱 Currency Toggle */}
              <CurrencyToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar Wrapper */}
      <div className="mx-auto max-w-[1720px] bg-white border-b border-gray-100">
        <div className="mx-auto max-w-[1440px] flex flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-24 py-4">
          <Link href="/" className="cursor-pointer">
            <img src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774851750/shri-divyam-logo.png" alt="shri-divyam" className="h-8 md:h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex w-full justify-center flex-wrap items-center gap-6 lg:gap-10 text-[18px] lg:text-[20px] text-gray-900 font-m">
            <Link href="/" className="hover:text-[#7A1F3D] cursor-pointer">Home</Link>
            <a href="#" className="hover:text-[#7A1F3D] cursor-pointer">Our Story</a>
            <a href="#" className="hover:text-[#7A1F3D] cursor-pointer">Explore Dresses</a>
            <a href="#" className="hover:text-[#7A1F3D] cursor-pointer">Gallery</a>
            <a href="#" className="hover:text-[#7A1F3D] cursor-pointer">Contact Us</a>
          </nav>

          {/* 📱 Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#7A1F3D] cursor-pointer p-1">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>

        {/* 📱 Mobile Menu Content */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[60] bg-black/50" onClick={() => setIsMenuOpen(false)}>
            <div
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <img src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774851750/shri-divyam-logo.png" alt="shri-divyam" className="h-8 w-auto" />
                <button onClick={() => setIsMenuOpen(false)} className="text-[#7A1F3D]">
                  <X size={28} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <Link href="/" className="text-[18px] font-medium text-gray-900 hover:text-[#7A1F3D]" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <a href="#" className="text-[18px] font-medium text-gray-900 hover:text-[#7A1F3D]" onClick={() => setIsMenuOpen(false)}>Our Story</a>
                <a href="#" className="text-[18px] font-medium text-gray-900 hover:text-[#7A1F3D]" onClick={() => setIsMenuOpen(false)}>Explore Dresses</a>
                <a href="#" className="text-[18px] font-medium text-gray-900 hover:text-[#7A1F3D]" onClick={() => setIsMenuOpen(false)}>Gallery</a>
                <a href="#" className="text-[18px] font-medium text-gray-900 hover:text-[#7A1F3D]" onClick={() => setIsMenuOpen(false)}>Contact Us</a>
              </div>

              <div className="mt-auto border-t pt-6">
                <div className="flex items-center gap-3 text-[#7A1F3D] font-medium">
                  <Phone size={20} />
                  <span>+91 8595046368</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </header>
  );
}

/* ─── Currency Toggle Component ─── */
function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <div className="flex items-center rounded-full border border-white/40 overflow-hidden text-[14px] font-semibold">
      <button
        id="currency-inr"
        onClick={() => toggleCurrency("INR")}
        className={`px-3 py-1 transition-all duration-200 cursor-pointer ${currency === "INR"
          ? "bg-white text-[#7A1F3D]"
          : "bg-transparent text-white hover:bg-white/10"
          }`}
      >
        INR
      </button>
      <button
        id="currency-usd"
        onClick={() => toggleCurrency("USD")}
        className={`px-3 py-1 transition-all duration-200 cursor-pointer ${currency === "USD"
          ? "bg-white text-[#7A1F3D]"
          : "bg-transparent text-white hover:bg-white/10"
          }`}
      >
        USD
      </button>
    </div>
  );
}