"use client";

import { Phone, Search, Menu, X, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, logout, isLoggedIn } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const syncQuantitiesFromServer = async () => {
    if (!isLoggedIn) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/proxy/cart", {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      
      const text = await res.text();
      if (res.ok && text) {
        const data = JSON.parse(text);
        const rawItems = data.cart_items || data.cart || data.items || data.data || [];
        let parsedItems = [];
        if (Array.isArray(rawItems)) {
            parsedItems = rawItems;
        } else if (rawItems && typeof rawItems === 'object') {
            parsedItems = rawItems._original_items || (Array.isArray(rawItems.items) ? rawItems.items : []);
        }
        
        let removedItems = [];
        try {
            const rStored = localStorage.getItem("shri_divyam_removed_cart_items");
            if (rStored) removedItems = JSON.parse(rStored);
        } catch(e) {}

        // Start with existing local quantities (may have been set by syncGuestCartToUser)
        let existingQuantities = {};
        try {
            const stored = localStorage.getItem("shri_divyam_cart_quantities");
            if (stored) existingQuantities = JSON.parse(stored);
        } catch(e) {}

        let newQuantities = { ...existingQuantities };
        parsedItems.forEach(item => {
            const pId = String(item.product_id || item.id || '');
            let vId = String(item.variant_id || item.variation_id || '');
            if (vId === "null" || vId === "undefined") vId = "";
            const key = `${pId}_${vId}`;
            
            const isRemoved = removedItems.some(r => r.pId === pId && (r.vId ? String(r.vId) === vId : true));
            
            if (!isRemoved) {
                // Check if this product already has a local quantity (from guest sync or user action)
                const hasLocalQty = Object.keys(existingQuantities).some(k => k.startsWith(`${pId}_`));
                if (!hasLocalQty) {
                    // Only set from server if we DON'T already have a local value for this product
                    newQuantities[key] = Number(item.quantity || 1);
                }
            }
        });
        localStorage.setItem("shri_divyam_cart_quantities", JSON.stringify(newQuantities));
        
        // Dispatch event so UI updates with cleaned quantities
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (e) {
      console.error("Header Sync Error:", e);
    }
  };

  const fetchCartCount = () => {
    // 1. Calculate count purely from local storage to guarantee instant UI updates
    try {
      const storedQuantities = localStorage.getItem("shri_divyam_cart_quantities");
      const removedItems = JSON.parse(localStorage.getItem("shri_divyam_removed_cart_items") || "[]");
      
      if (storedQuantities) {
        const quantities = JSON.parse(storedQuantities);
        let totalItems = 0;
        
        Object.entries(quantities).forEach(([key, qty]) => {
          if (Number(qty) > 0) {
              const [pId, vId] = key.split('_');
              
              // Skip corrupted keys from old bugs
              if (vId === "null" || vId === "undefined") return;
              
              const isRemoved = removedItems.some(r => String(r.pId) === String(pId) && (r.vId ? String(r.vId) === String(vId) : true));
              
              if (!isRemoved) {
                  totalItems += 1;
              }
          }
        });
        
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    } catch (e) { 
      setCartCount(0); 
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchCartCount();
    
    // Only sync from server once on mount if logged in
    if (isLoggedIn) {
      syncQuantitiesFromServer();
    }

    const handleUpdate = () => fetchCartCount();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("cartUpdated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("cartUpdated", handleUpdate);
    };
  }, [isLoggedIn]);

  if (!isMounted) {
    // Return a simplified header or a skeleton during server-side rendering
    // to match exactly what the initial client render will be before hydration.
    return (
        <header className="sticky top-0 z-50 w-full bg-[#7A1F3D] h-[60px]"></header>
    );
  }

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* 🔴 Top Bar Wrapper */}
      <div className="mx-auto max-w-[1720px] bg-[#7A1F3D]">
        <div className="mx-auto max-w-[1440px] flex flex-col gap-3 px-4 sm:px-6 md:px-12 lg:px-24 py-3 md:flex-row md:items-center md:justify-between text-white text-sm">
          <div className="flex items-center gap-2 md:gap-6 w-full md:w-auto">
            <div className="flex items-center text-[14px] sm:text-[15px] md:text-[16px] gap-2">
              <Phone size={16} className="shrink-0" />
              {/* <span className="whitespace-nowrap font-medium">+91 8595046368</span> */}
              <a href="tel:+918595046368" className="hover:text-white transition-colors whitespace-nowrap">
                +91 8595046368
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end flex-wrap items-start sm:items-center gap-4 md:gap-6 text-[16px] md:text-[18px] w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative w-[180px] sm:w-48 md:w-64">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
                className="w-full rounded-[0.30rem] border border-gray-300 bg-white px-4 pr-10 py-2 text-xs sm:text-sm text-gray-800 shadow-sm outline-none transition duration-150 focus:border-[#7A1F3D] focus:ring-2 focus:ring-[#7A1F3D]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 z-20"
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A1F3D] z-10">
                <Search
                  size={18}
                  className="md:w-[22px]"
                />
              </button>
            </form>
            <div className="flex items-center gap-4 text-[14px] sm:text-[15px] md:text-[18px] sm:gap-4 md:gap-4 w-auto sm:w-auto justify-start sm:justify-end">
              {!isLoggedIn ? (
                <Link href="/login" className="flex items-center gap-1.5 md:gap-2 cursor-pointer hover:text-white transition-colors">
                  <img src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856036/Mask_group_3_mw7ria.png" alt="account" className="h-4 md:h-5 w-auto" />
                  <span>Account</span>
                </Link>
              ) : (
                <div className="relative flex items-center gap-1.5 md:gap-2 cursor-pointer py-1">
                  <div 
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    className="flex items-center gap-1.5 md:gap-2"
                  >
                    <img src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856036/Mask_group_3_mw7ria.png" alt="account" className="h-4 md:h-5 w-auto" />
                    <span className="max-w-[80px] sm:max-w-[100px] truncate">Hi, {typeof user === 'string' ? user : (user?.first_name || user?.name || user?.username || "User")}</span>
                  </div>
                  
                  {/* Dropdown - Controlled by state instead of hover */}
                  {isAccountOpen && (
                    <>
                      {/* Overlay to catch clicks outside */}
                      <div className="fixed inset-0 z-50" onClick={() => setIsAccountOpen(false)}></div>
                      
                      <div className="absolute top-full right-0 mt-1 w-40 bg-white text-[#7A1F3D] shadow-xl rounded-sm z-[60] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="py-1">
                          <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-gray-50 border-b border-gray-100">
                            Settings
                          </div>
                          <Link 
                            href="/profile/addresses"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#7A1F3D] hover:text-white text-[13px] font-medium transition-colors"
                          >
                            <MapPin size={14} />
                            My Addresses
                          </Link>
                          
                          <div className="h-[1px] bg-gray-100 my-1"></div>
                          
                          <button 
                            onClick={() => {
                              logout();
                              setIsAccountOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-red-600 text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-2"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <Link href="/my-bag" className="flex items-center gap-1.5 md:gap-2 cursor-pointer hover:text-white transition-colors group relative">
                <div className="relative">
                  <img src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774855916/Mask_group_2_zcgcsh.png" alt="bag" className="h-4 md:h-5 w-auto" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#7A1F3D] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white animate-in zoom-in duration-300">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
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
            <Link href="/contact" className="hover:text-[#7A1F3D] cursor-pointer">Contact Us</Link>
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
                <Link href="/contact" className="text-[18px] font-medium text-gray-900 hover:text-[#7A1F3D]" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
              </div>

              <div className="mt-auto -mx-6 -mb-6 bg-[#7A1F3D] p-6">
                <a href="tel:+918595046368" className="flex items-center gap-3 text-white font-medium hover:opacity-90 transition-opacity">
                  <Phone size={20} />
                  <span>+91 8595046368</span>
                </a>
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-24 h-8 bg-white/20 rounded-full animate-pulse"></div>;

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