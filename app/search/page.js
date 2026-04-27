"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query.trim()) {
                setProducts([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Try fetching all products and filter locally for now
                // Ideally, your backend should have a search endpoint like: /api/products?search=${query}
                const response = await fetch("/api/proxy/products");
                if (!response.ok) throw new Error("Failed to fetch products");
                
                const data = await response.json();
                const allProducts = data.products || data.data || [];
                
                // Filter products based on query (checks name and description)
                const filtered = allProducts.filter(p => {
                    const searchTerm = query.toLowerCase();
                    const name = (p.name || p.title || "").toLowerCase();
                    const desc = (p.description || p.short_description || "").toLowerCase();
                    return name.includes(searchTerm) || desc.includes(searchTerm);
                });

                const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";
                
                // Format products to match ProductCard expectations
                const formatted = filtered.map(p => ({
                    id: p.id,
                    title: p.name || p.title,
                    slug: p.slug,
                    description: p.short_description || p.description || "Premium Dress",
                    price: p.price,
                    usdPrice: p.usd_price,
                    image: p.image_path ? `${IMAGE_BASE_URL}${p.image_path}` : (p.image || ""),
                }));

                setProducts(formatted);
            } catch (err) {
                console.error("Search Error:", err);
                setError("Something went wrong while searching. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#7A1F3D] mb-4" size={40} />
                <p className="text-gray-500 font-medium">Searching for "{query}"...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 mx-auto w-full max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24 py-10 sm:py-16">
            <div className="mb-10">
                <h1 className="text-[24px] sm:text-[32px] font-playfair text-[#303030] font-bold">
                    {products.length > 0 ? (
                        <>Results for <span className="text-[#7A1F3D]">"{query}"</span></>
                    ) : (
                        <>No results found for <span className="text-[#7A1F3D]">"{query}"</span></>
                    )}
                </h1>
                <p className="mt-2 text-gray-500 text-sm italic">
                    Found {products.length} {products.length === 1 ? 'product' : 'products'} matching your search.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-sm border border-red-100 mb-10">
                    {error}
                </div>
            )}

            {products.length === 0 ? (
                <div className="text-center py-20 bg-[#F9F7F5] border border-dashed border-[#E8DDD4] rounded-sm">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-[#303030] mb-2">We couldn't find anything</h3>
                    <p className="text-gray-500 max-w-md mx-auto px-6">
                        Try checking your spelling or use more general terms to find what you're looking for.
                    </p>
                    <Link href="/" className="inline-block mt-8 bg-[#7A1F3D] text-white px-8 py-3 font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#5E182F] transition-colors shadow-lg">
                        Browse Collections
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                    {products.map((item) => (
                        <Link href={`/product-details/${item.slug}`} key={item.id} className="block group">
                            <div className="h-full transition-all duration-300 hover:-translate-y-2">
                                <ProductCard product={item} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <main className="bg-white min-h-screen flex flex-col font-primary">
            <Header />
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-[#7A1F3D]" size={40} />
                </div>
            }>
                <SearchResults />
            </Suspense>
            <Footer />
        </main>
    );
}
