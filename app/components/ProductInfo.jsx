"use client";

import { useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { Share, Info } from "lucide-react";

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
    const variationPrice = variation ? Number(variation.extra_price) : 0;
    const currentPrice = variationPrice > 0 ? variationPrice : (product.basePrice || 0);

    return (
        <div className="w-full font-gt-walsheim relative">
            {/* Background Watermark */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-contain bg-no-repeat bg-center z-[-1] opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Where%20Devotion%20Meets%20Royal%20Elegance.png")' }}
            />

            <h1 className="w-full lg:max-w-[450px] text-[32px] font-playfair font-medium leading-[1.15] text-[#303030]">
                {product.title}
            </h1>

            <p className="mt-2 text-[12px] uppercase tracking-[0.25em] font-medium text-[#9CA3AF]">
                Online Exclusive
            </p>

            <div className="mt-4 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-[26px] font-bold text-[#7A1F3D]">
                    {formatPrice(currentPrice, variation?.usd_price || product.usdPrice)}
                </span>
            </div>

            <p className="mt-1 text-[11px] uppercase tracking-wider font-semibold text-[#6B7280]">
                {selectedColor} {product.material ? `+ ${product.material}` : ''}
            </p>



            <div className="mt-8">
                <div className="flex items-center justify-between lg:max-w-[320px] mb-2.5">
                    <p className="text-[14px] font-semibold text-[#303030]">Size: {selectedSize}</p>
                    <button className="text-[12px] font-medium text-[#3b5ea8] underline border-none bg-transparent cursor-pointer">
                        Find your size
                    </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    {product.sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`flex h-[42px] min-w-[42px] px-3 items-center font-medium justify-center border transition ${selectedSize === size
                                ? "border-[#7A1F3D] bg-[#7A1F3D] text-white"
                                : "border-[#e5e7eb] bg-white text-[#303030] hover:border-[#7A1F3D]"
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <p className="mb-2.5 text-[14px] font-semibold text-[#303030]">Quantity</p>
                <div className="flex h-10 w-[110px] items-center border border-[#e5e7eb] bg-white">
                    <button
                        onClick={decrement}
                        className="flex h-full w-10 items-center justify-center text-[#303030] hover:bg-gray-50 transition"
                    >
                        -
                    </button>
                    <div className="flex flex-1 items-center justify-center border-x border-[#e5e7eb] text-[15px] font-medium">
                        {quantity}
                    </div>
                    <button
                        onClick={increment}
                        className="flex h-full w-10 items-center justify-center text-[#303030] hover:bg-gray-50 transition"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="mt-6">
                <p className="mb-2.5 text-[14px] font-semibold text-[#303030]">Select Color</p>
                <div className="flex gap-3.5">
                    {product.colors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`h-[34px] w-[34px] rounded-full border-2 transition-all ${selectedColor === color ? "border-[#303030] p-0.5" : "border-transparent"
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

            <div className="mt-8 w-full lg:max-w-[320px] space-y-3.5">
                <button className="w-full bg-[#7A1F3D] py-4 text-[15px] font-semibold uppercase tracking-wider text-white transition hover:bg-[#6c1b36] shadow-sm">
                    Shop Now
                </button>

                <button className="w-full border border-[#7A1F3D] bg-white py-4 text-[15px] font-semibold uppercase tracking-wider text-[#7A1F3D] transition hover:bg-[#fff9fa]">
                    Add To Cart
                </button>

                <p className="text-[12px] text-center text-[#6B7280]">
                    Shipping calculated at checkout
                </p>
            </div>

            <div className="mt-7 w-full lg:max-w-[320px] border border-[#fce7ed] bg-[#fff9fa] rounded-sm p-4.5">
                <div className="space-y-3 text-[13px] text-[#4b4742]">
                    <div className="flex justify-between">
                        <span>Delhi / NCR :</span>
                        <span className="font-bold">2 - 4 Days</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Rest of India :</span>
                        <span className="font-bold">3 - 8 Days</span>
                    </div>

                    <div className="flex justify-between">
                        <span>International :</span>
                        <span className="font-bold">7 - 14 Days</span>
                    </div>
                </div>

                <p className="mt-4 text-[12px] text-center font-medium text-[#7A1F3D]">
                    COD available. Beware of fake websites.
                </p>
            </div>

            <div className="mt-6 flex items-center gap-6 text-[14px] font-medium text-[#4B5563]">
                <button className="flex items-center gap-1.5 hover:text-[#303030] transition bg-transparent border-none cursor-pointer">
                    <span className="text-[12px] border border-gray-400 rounded-full w-4 h-4 flex items-center justify-center">i</span>
                    Delivery & Return
                </button>
                <button className="flex items-center gap-1.5 hover:text-[#303030] transition bg-transparent border-none cursor-pointer">
                    <span className="text-[12px] border border-gray-400 rounded-px w-4 h-4 flex items-center justify-center">S</span>
                    Share
                </button>
            </div>
        </div>
    );
}