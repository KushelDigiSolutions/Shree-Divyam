"use client";

import { useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { Share, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductInfo({
    product,
    selectedColor: propColor,
    setSelectedColor: propSetColor,
    selectedSize: propSize,
    setSelectedSize: propSetSize
}) {
    const [internalQuantity, setQuantity] = useState(1);
    const [internalSize, setInternalSize] = useState(product.sizes[0]);
    const [internalColor, setInternalColor] = useState(product.colors[0]);

    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const quantity = internalQuantity;
    const selectedSize = propSize !== undefined ? propSize : internalSize;
    const setSelectedSize = propSetSize || setInternalSize;

    const selectedColor = propColor !== undefined ? propColor : internalColor;
    const setSelectedColor = propSetColor || setInternalColor;

    const decrement = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const increment = () => {
        setQuantity(quantity + 1);
    };

    const { formatPrice, currency } = useCurrency();

    // Find the current active variation from API
    const activeVariation = product.variations?.find(v => v.color === selectedColor && v.size === selectedSize);
    const fallbackVariation = product.variations?.find(v => v.color === selectedColor) || product.variations?.[0];
    const variation = activeVariation || fallbackVariation;

    // Determine the active price
    const variationPrice = variation ? Number(variation.price) : 0;
    const currentPrice = variationPrice > 0 ? variationPrice : (product.basePrice || 0);

    const router = useRouter();

    const handleAddToCart = () => {
        if (!variation || !variation.id) {
            setMessage({ type: "error", text: "Please select a valid variant" });
            return;
        }

        const params = new URLSearchParams({
            productId: product.id.toString(),
            variantId: variation.id.toString(),
            quantity: quantity.toString(),
            name: product.title,
            image: product.images?.[0] || "",
            priceINR: currentPrice.toString(),
            priceUSD: (variation?.usd_price || product.usdPrice || "").toString(),
            variantName: `${selectedSize} / ${selectedColor}`
        });

        router.push(`/cart?${params.toString()}`);
    };

    return (
        <div className="w-full font-gt-walsheim relative flex flex-col items-center lg:items-start text-center lg:text-left px-4 sm:px-6 lg:px-0">
            {/* Background Watermark */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] sm:w-[350px] sm:h-[350px] lg:w-[400px] lg:h-[400px] bg-contain bg-no-repeat bg-center z-[-1] opacity-[0.03] sm:opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Where%20Devotion%20Meets%20Royal%20Elegance.png")' }}
            />

            <h1 className="w-full lg:max-w-[450px] text-[22px] sm:text-[28px] md:text-[32px] font-playfair font-medium leading-[1.2] text-[#303030]">
                {product.title}
            </h1>

            <p className="mt-2 text-[10px] sm:text-[12px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-medium text-[#9CA3AF]">
                Online Exclusive
            </p>

            <div className="mt-3 sm:mt-4 flex items-baseline gap-2 flex-wrap justify-center lg:justify-start">
                <span className="text-[20px] sm:text-[26px] font-bold text-[#7A1F3D]">
                    {formatPrice(currentPrice, variation?.usd_price || product.usdPrice)}
                </span>
            </div>

            <p className="mt-1 text-[9px] sm:text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                {selectedColor} {product.material ? `+ ${product.material}` : ''}
            </p>


            <div className="mt-6 sm:mt-8 w-full">
                <div className="flex items-center justify-between lg:max-w-[320px] mb-2 sm:mb-3">
                    <p className="text-[13px] sm:text-[14px] font-semibold text-[#303030]">Size: {selectedSize}</p>
                    <button className="text-[11px] sm:text-[12px] font-medium text-[#3b5ea8] underline border-none bg-transparent cursor-pointer">
                        Find your size
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-center lg:justify-start">
                    {product.sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`flex h-[36px] min-w-[36px] sm:h-[42px] sm:min-w-[42px] px-2.5 sm:px-3 items-center font-medium justify-center border transition cursor-pointer rounded-sm text-[13px] sm:text-base ${selectedSize === size
                                ? "border-[#7A1F3D] bg-[#7A1F3D] text-white shadow-sm"
                                : "border-gray-200 bg-white text-[#303030] hover:border-[#7A1F3D]"
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 sm:mt-7 w-full">
                <p className="mb-2 sm:mb-3 text-[13px] sm:text-[14px] font-semibold text-[#303030]">Quantity</p>
                <div className="flex h-10 sm:h-11 w-[110px] sm:w-[120px] mx-auto lg:mx-0 items-center border border-gray-200 bg-white rounded-sm overflow-hidden shadow-sm">
                    <button
                        onClick={decrement}
                        className="flex h-full w-9 sm:w-10 items-center justify-center text-[#303030] hover:bg-gray-50 transition cursor-pointer text-base sm:text-lg"
                    >
                        -
                    </button>
                    <div className="flex flex-1 items-center justify-center border-x border-gray-100 text-[14px] sm:text-[15px] font-semibold">
                        {quantity}
                    </div>
                    <button
                        onClick={increment}
                        className="flex h-full w-9 sm:w-10 items-center justify-center text-[#303030] hover:bg-gray-50 transition cursor-pointer text-base sm:text-lg"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="mt-6 sm:mt-7 w-full">
                <p className="mb-2 sm:mb-3 text-[13px] sm:text-[14px] font-semibold text-[#303030]">Select Color</p>
                <div className="flex gap-3 sm:gap-4 justify-center lg:justify-start">
                    {product.colors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`h-[30px] w-[30px] sm:h-[36px] sm:w-[36px] rounded-full border-2 transition-all cursor-pointer shadow-sm ${selectedColor === color ? "border-[#7A1F3D] p-0.5" : "border-transparent"
                                }`}
                        >
                            <div
                                className="h-full w-full rounded-full border border-gray-100"
                                style={{ backgroundColor: color }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 sm:mt-10 w-full lg:max-w-[320px] space-y-3.5 sm:space-y-4">
                <button className="w-full bg-[#7A1F3D] border border-[#7A1F3D] py-3 sm:py-4 text-[13px] sm:text-[15px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-[#7A1F3D] shadow-md cursor-pointer rounded-sm active:scale-95">
                    Shop Now
                </button>

                <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`w-full border border-[#7A1F3D] bg-white py-3 sm:py-4 text-[13px] sm:text-[15px] font-bold uppercase tracking-widest text-[#7A1F3D] transition-all duration-300 hover:bg-[#7A1F3D] hover:text-white cursor-pointer rounded-sm active:scale-95 flex items-center justify-center gap-2 ${isAdding ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                    {isAdding ? (
                        <>
                            <span className="w-4 h-4 border-2 border-[#7A1F3D] border-t-transparent rounded-full animate-spin"></span>
                            Adding...
                        </>
                    ) : (
                        "Add To Cart"
                    )}
                </button>

                {message.text && (
                    <p className={`text-center text-[12px] font-medium mt-2 p-2 rounded-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {message.text}
                    </p>
                )}

                <p className="text-[11px] sm:text-[12px] text-center text-gray-500 italic">
                    Shipping calculated at checkout
                </p>
            </div>


            <div className="mt-8 w-full lg:max-w-[320px] border border-[#fce7ed] bg-[#fff9fa] rounded-sm p-5 shadow-sm">
                <div className="space-y-3.5 text-[13px] sm:text-[14px] text-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Delhi / NCR :</span>
                        <span className="font-bold text-[#7A1F3D] bg-white/60 px-2 py-0.5 rounded">2 - 4 Days</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-medium">Rest of India :</span>
                        <span className="font-bold text-[#7A1F3D] bg-white/60 px-2 py-0.5 rounded">3 - 8 Days</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-medium">International :</span>
                        <span className="font-bold text-[#7A1F3D] bg-white/60 px-2 py-0.5 rounded">7 - 14 Days</span>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#fce7ed] flex items-center justify-center gap-2">
                    <Info size={14} className="text-[#7A1F3D]" />
                    <p className="text-[11px] font-semibold text-[#7A1F3D] uppercase tracking-wider">
                        COD available & Secure Payment
                    </p>
                </div>
            </div>

            <div className="mt-8 mb-4 flex items-center gap-8 text-[13px] sm:text-[14px] font-medium text-[#4B5563]">
                <button className="flex items-center gap-2 hover:text-[#7A1F3D] transition bg-transparent border-none cursor-pointer group">
                    <span className="text-[10px] border border-gray-400 font-bold group-hover:border-[#7A1F3D] rounded-full w-4.5 h-4.5 flex items-center justify-center">i</span>
                    Delivery & Return
                </button>
                <button className="flex items-center gap-2 hover:text-[#7A1F3D] transition bg-transparent border-none cursor-pointer group">
                    <Share size={16} className="group-hover:text-[#7A1F3D]" />
                    Share
                </button>
            </div>
        </div>
    );
}