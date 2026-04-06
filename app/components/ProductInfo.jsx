"use client";

import { useState } from "react";

export default function ProductInfo({ product }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);

    const decrement = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const increment = () => {
        setQuantity(quantity + 1);
    };

    return (
        <div className="w-full font-gt-walsheim">
            <h1 className="w-full lg:max-w-[380px] text-[24px] sm:text-[28px] lg:text-[32px] font-playfair font-medium leading-[1.1] text-[#303030]">
                {product.title}
            </h1>

            <p className="mt-2 text-[13px] uppercase  tracking-[0.2em] text-[#9CA3AF]">
                Online Exclusive
            </p>

            <div className="mt-4 text-[28px] font-medium  text-[#2e2a28]">{product.price}</div>

            <div className="mt-5 w-full lg:max-w-[350px] text-[15px] sm:text-[16px] font-light font-gt-walsheim leading-relaxed text-[#303030]">
                {product.fullDescription || product.description}
            </div>

           

            <div className="mt-5">
                <p className="mb-2 text-[13px] font-semibold text-[#000000]">Size:</p>
                <div className="flex gap-2">
                    {product.sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`flex h-12 w-12 items-center font-semibold justify-center border text-[18px] transition ${selectedSize === size
                                    ? "border-[#8a1d45] bg-[#8a1d45] text-white"
                                    : "border-[#d2c5b5] bg-white text-[#ffffff]"
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-5">
                <p className="mb-2 text-[13px] font-semibold text-[#000000]">Quantity:</p>
                <div className="flex h-12 w-[110px] items-center border border-[#d2c5b5] bg-white">
                    <button
                        onClick={decrement}
                        className="flex h-full w-12 items-center justify-center text-[#303030]"
                    >
                        -
                    </button>
                    <div className="flex flex-1 items-center   justify-center border-x border-[#d2c5b5] text-[15px]">
                        {quantity}
                    </div>
                    <button
                        onClick={increment}
                        className="flex h-full w-12 items-center justify-center text-[#303030]"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="mt-5">
                <p className="mb-2 text-[15px] font-semibold text-[#000000]">Select Color</p>
                <div className="flex gap-3">
                    {product.colors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`h-10 w-10 rounded-full border-2 ${selectedColor === color ? "border-[#2f2a28]" : "border-transparent"
                                }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-6 w-full lg:max-w-[320px] space-y-3">
                <button className="w-full bg-[#7A1F3D] py-3.5 text-[15px] sm:text-[16px] font-medium uppercase tracking-[0.08em] text-white transition hover:opacity-95 active:scale-95">
                    Shop Now
                </button>

                <button className="w-full border border-[#7A1F3D] bg-white py-3.5 text-[15px] sm:text-[16px] font-medium uppercase tracking-[0.08em] text-[#7A1F3D] transition hover:bg-[#faf7f2] active:scale-95">
                    Add To Cart
                </button>
            </div>

            <div className="mt-6 w-full lg:max-w-[320px] border border-[#7A1F3D] bg-white p-4">
                <div className="grid grid-cols-2 gap-y-3 text-[14px] sm:text-[16px] text-[#333333]">
                    <span>Delhi / NCR :</span>
                    <span className="text-right">2 - 4 Days</span>

                    <span>Rest of India :</span>
                    <span className="text-right">3 - 4 Days</span>

                    <span>International</span>
                    <span className="text-right">7 - 14 Days</span>
                </div>

                <p className="mt-4 text-[14px] sm:text-[15px] text-[#7A1F3D]">
                    COD available. Beware of fake websites.
                </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-[16px] text-[#4B5563]">
                <span>● Delivery &amp; Return</span>
                <span>● Stores</span>
            </div>
        </div>
    );
}