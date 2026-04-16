"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Loader2, ArrowLeft, ShoppingBag, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

function CartContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const productId = searchParams.get("productId");
    const [variantId, setVariantId] = useState(searchParams.get("variantId"));
    const quantity = searchParams.get("quantity") || "1";
    const productName = searchParams.get("name") || "Premium Product";
    const productImage = searchParams.get("image");
    const productPrice = searchParams.get("price");
    const [productVariantName, setProductVariantName] = useState(searchParams.get("variantName") || "");
    const slug = searchParams.get("slug");

    const [isAdding, setIsAdding] = useState(false);
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    useEffect(() => {
        // If we have productId but no variantId, fetch variants from API using slug
        if (productId && !variantId && slug) {
            const fetchVariants = async () => {
                setIsLoadingVariants(true);
                try {
                    const res = await fetch(`https://shreedivyam.kdscrm.com/api/products/${slug}`);
                    const data = await res.json();
                    if (data && data.product && data.product.variations) {
                        const variations = data.product.variations;
                        if (variations.length > 0) {
                            // Default to first variant
                            setVariantId(variations[0].id);
                            setProductVariantName(`${variations[0].size} / ${variations[0].color}`);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch variants:", e);
                } finally {
                    setIsLoadingVariants(false);
                }
            };
            fetchVariants();
        }
    }, [productId, variantId, slug]);

    const handleConfirmAdd = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setStatus({ type: "error", message: "Please login to add items to cart." });
            return;
        }

        if (!variantId) {
            setStatus({ type: "error", message: "Please wait, or select a variant first." });
            return;
        }

        setIsAdding(true);
        setStatus({ type: "", message: "" });

        try {
            const response = await fetch("https://shreedivyam.kdscrm.com/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: Number(productId),
                    variant_id: Number(variantId),
                    quantity: Number(quantity)
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: "success", message: "Product successfully added to your cart!" });
            } else {
                setStatus({ type: "error", message: data.message || "Failed to add product to cart." });
            }
        } catch (error) {
            console.error("Cart API Error:", error);
            setStatus({ type: "error", message: "Something went wrong. Please check your connection." });
        } finally {
            setIsAdding(false);
        }
    };

    if (!productId || (isLoadingVariants && !variantId)) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                {isLoadingVariants ? (
                    <Loader2 size={48} className="text-[#7A1F3D] animate-spin mb-6" />
                ) : (
                    <ShoppingBag size={64} className="text-gray-300 mb-6" />
                )}
                <h2 className="text-2xl font-playfair font-semibold text-[#303030] mb-2">
                    {isLoadingVariants ? "Loading details..." : "Your pending cart is empty"}
                </h2>
                {!isLoadingVariants && (
                    <p className="text-gray-500 mb-8 max-w-md">It looks like you haven't selected a product to add yet. Browse our latest collection to find something special.</p>
                )}
                {!isLoadingVariants && (
                    <Link href="/">
                        <button className="bg-[#7A1F3D] text-white px-8 py-3 font-medium hover:bg-[#5E182F] transition">
                            Browse Collection
                        </button>
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24 py-12">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <Link href="/" className="hover:text-[#7A1F3D] transition">Home</Link>
                <span>/</span>
                <span className="text-[#303030] font-medium">Add to Cart</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.6fr] gap-12 items-start">
                {/* Left Side: Product Summary */}
                <div className="bg-white border border-[#E8DDD4] rounded-sm p-6 sm:p-8 shadow-sm">
                    <h2 className="text-2xl font-playfair font-semibold text-[#303030] mb-8 border-b pb-4">
                        Review Your Selection
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className="w-full sm:w-[200px] aspect-square bg-gray-50 rounded-sm overflow-hidden border border-gray-100">
                            {productImage ? (
                                <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 italic">No Image</div>
                            )}
                        </div>

                        <div className="flex-1 space-y-6">
                            <div>
                                <h3 className="text-2xl font-medium text-[#303030] mb-2">{productName}</h3>
                                {productPrice && (
                                    <p className="text-2xl font-bold text-[#7A1F3D]">{productPrice}</p>
                                )}
                            </div>

                            <div className="bg-[#F9F7F5] border border-[#E8DDD4] p-5 rounded-sm space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#7A1F3D] border-b border-[#E8DDD4] pb-2 mb-3">
                                    Cart Details
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                                    <div className="flex justify-between items-center py-1 border-b border-gray-100 sm:border-none">
                                        <span className="text-gray-500 text-sm">Product ID</span>
                                        <span className="font-bold text-[#303030] bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{productId}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-gray-100 sm:border-none">
                                        <span className="text-gray-500 text-sm">Variant ID</span>
                                        <span className="font-bold text-[#303030] bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{variantId || (isLoadingVariants ? "Loading..." : "N/A")}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-gray-100 sm:border-none">
                                        <span className="text-gray-500 text-sm">Quantity</span>
                                        <span className="font-bold text-[#303030] bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{quantity}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-500 text-sm">Selection</span>
                                        <span className="font-medium text-[#7A1F3D]">{productVariantName || "Standard Selection"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Action Box */}
                <div className="bg-[#FDF8F3] border border-[#E8DDD4] rounded-sm p-6 sm:p-8 shadow-md">
                    <h3 className="text-lg font-semibold text-[#303030] mb-6">Order Summary</h3>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal ({quantity} item)</span>
                            <span className="font-medium">{productPrice || "TBD"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-green-600 font-medium">Calculated at checkout</span>
                        </div>
                        <div className="pt-4 border-t border-[#E8DDD4] flex justify-between">
                            <span className="font-bold text-[#303030]">Estimated Total</span>
                            <span className="font-bold text-[#7A1F3D] text-lg">{productPrice || "TBD"}</span>
                        </div>
                    </div>

                    {status.message && (
                        <div className={`mb-6 p-4 rounded-sm flex items-start gap-3 ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            {status.type === "success" ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}

                    <button
                        onClick={handleConfirmAdd}
                        disabled={isAdding || isLoadingVariants}
                        className={`w-full py-4 bg-[#7A1F3D] text-white font-bold uppercase tracking-widest hover:bg-[#5E182F] transition-all flex items-center justify-center gap-2 rounded-sm shadow-lg active:scale-95 ${isAdding || isLoadingVariants ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Processing...
                            </>
                        ) : isLoadingVariants ? (
                            "Loading..."
                        ) : (
                            "Confirm Add To Cart"
                        )}
                    </button>
                    
                    <button 
                        onClick={() => router.back()}
                        className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-[#7A1F3D] transition"
                    >
                        <ArrowLeft size={16} />
                        Keep Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CartPage() {
    return (
        <main className="bg-white min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 bg-[#F9F7F5]">
                <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-[#7A1F3D]" size={48} />
                    </div>
                }>
                    <CartContent />
                </Suspense>
            </div>
            <Footer />
        </main>
    );
}
