"use client";

import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
    useEffect(() => {
        // Clear all cart related persistent data after successful order
        localStorage.removeItem("shri_divyam_cart_quantities");
        localStorage.removeItem("shri_divyam_removed_cart_items");
        localStorage.removeItem("shri_divyam_guest_cart");
        
        // Signal header to update count (it will see 0 now)
        window.dispatchEvent(new Event("cartUpdated"));
    }, []);

    return (
        <main className="bg-white min-h-screen flex flex-col font-primary">
            <Header />
            
            <div className="flex-1 bg-[#F9F7F5] flex items-center justify-center py-20 px-4">
                <div className="max-w-[500px] w-full bg-white border border-[#E8DDD4] p-10 sm:p-12 shadow-2xl rounded-sm text-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center shadow-inner animate-in zoom-in duration-500 border border-green-100">
                            <CheckCircle2 size={48} strokeWidth={1.5} />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-[#303030] mb-4">Jai Shri Krishna!</h1>
                    <h2 className="text-xl font-bold text-[#7A1F3D] uppercase tracking-[0.2em] text-sm mb-6">Order Placed Successfully</h2>
                    
                    <p className="text-gray-500 text-sm leading-relaxed mb-10">
                        Thank you for shopping with Shri Divyam. Your order has been received and is being prepared with love and devotion. You will receive a confirmation message shortly.
                    </p>
                    
                    <div className="space-y-4">
                        <Link href="/">
                            <button className="w-full py-4 bg-[#7A1F3D] text-white font-bold uppercase tracking-[0.25em] text-xs shadow-xl hover:bg-[#5E182F] transition-all flex items-center justify-center gap-3 rounded-sm">
                                <ShoppingBag size={18} />
                                Continue Shopping
                            </button>
                        </Link>
                        
                        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#7A1F3D] transition py-2">
                            Back to Home
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
