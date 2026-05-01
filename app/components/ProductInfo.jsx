"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { Minus, Plus, ShoppingBag, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToCart, getCartItemQuantity, updateCartItemQuantity, removeCartItem } from "../utils/cartUtils";

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
    const [isUpdating, setIsUpdating] = useState(false);
    const [cartQty, setCartQty] = useState(0);
    const [activeVariantId, setActiveVariantId] = useState(null);
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
        const stockQty = Number(variation?.quantity || variation?.stock || 1);
        if (quantity < stockQty) {
            setQuantity(quantity + 1);
        } else {
            setMessage({ type: "error", text: `Only ${stockQty} item(s) available in stock` });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
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

    // Check if product is already in cart on mount & listen for updates
    useEffect(() => {
        const checkCart = () => {
            const { quantity: qty, variantId } = getCartItemQuantity(product, variation?.id);
            
            // Re-verify if the found variant matches our currently selected one
            const currentVariantId = String(variation?.id || "");
            if (String(variantId) === currentVariantId) {
                setCartQty(qty);
                setActiveVariantId(variantId);
            } else {
                setCartQty(0);
                setActiveVariantId(null);
            }
        };
        checkCart();
        window.addEventListener("cartUpdated", checkCart);
        return () => window.removeEventListener("cartUpdated", checkCart);
    }, [product.id, product.slug, selectedColor, selectedSize, variation?.id]);

    // Handle color selection - Reset quantity to 1 as requested
    const handleColorChange = (newColor) => {
        setSelectedColor(newColor);
        setQuantity(1);
        setMessage({ type: "", text: "" });
    };

    const handleAddToCart = async () => {
        if (!variation || !variation.id) {
            setMessage({ type: "error", text: "Please select a valid variant" });
            return;
        }

        setIsAdding(true);
        setMessage({ type: "", text: "" });

        try {
            const result = await addToCart(product, quantity, variation.id);

            if (result.success) {
                setCartQty(quantity);
                setActiveVariantId(variation.id);
                setMessage({ type: "success", text: "Successfully added to your bag!" });
                setTimeout(() => setMessage({ type: "", text: "" }), 5000);
            } else {
                setMessage({ type: "error", text: result.message || "Failed to add to cart." });
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            setMessage({ type: "error", text: "Something went wrong. Please try again." });
        } finally {
            setIsAdding(false);
        }
    };

    const handleCartQtyChange = async (newQty) => {
        if (isUpdating) return;
        
        const stockQty = Number(variation?.quantity || variation?.stock || 1);
        
        // Check if new quantity exceeds stock
        if (newQty > 0 && newQty > stockQty) {
            setMessage({ type: "error", text: `Only ${stockQty} item(s) available in stock` });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            return;
        }

        setIsUpdating(true);

        if (newQty <= 0) {
            const result = await removeCartItem(product, activeVariantId);
            if (result.success) {
                setCartQty(0);
                setActiveVariantId(null);
            }
        } else {
            const result = await updateCartItemQuantity(product, newQty, activeVariantId);
            if (result.success) {
                setCartQty(newQty);
            }
        }
        setIsUpdating(false);
    };

    // Determine what the Add to Cart button area should show
    const renderCartButton = () => {
        if (cartQty > 0) {
            // Product is in cart — show "Added" state with quantity controls
            return (
                <div className="space-y-3">
                    <div className="w-full border-2 border-green-600 bg-green-50 py-3 sm:py-4 rounded-sm flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} className="text-green-600" />
                        <span className="text-[13px] sm:text-[15px] font-bold uppercase tracking-widest text-green-700">
                            Added to Cart
                        </span>
                    </div>

                    {/* Inline quantity controls */}
                    <div className="flex items-center justify-between border border-[#7A1F3D] rounded-sm h-[48px] bg-white overflow-hidden">
                        <button
                            onClick={() => handleCartQtyChange(cartQty - 1)}
                            disabled={isUpdating}
                            className="flex h-full w-14 items-center justify-center text-[#7A1F3D] hover:bg-[#7A1F3D] hover:text-white transition cursor-pointer disabled:opacity-50"
                        >
                            <Minus size={18} />
                        </button>
                        <div className="flex items-center justify-center gap-2 text-[16px] font-bold text-[#303030]">
                            {isUpdating && <Loader2 size={14} className="animate-spin text-[#7A1F3D]" />}
                            {cartQty}
                        </div>
                        <button
                            onClick={() => handleCartQtyChange(cartQty + 1)}
                            disabled={isUpdating || cartQty >= (Number(variation?.quantity || variation?.stock || 1))}
                            className="flex h-full w-14 items-center justify-center text-[#7A1F3D] hover:bg-[#7A1F3D] hover:text-white transition cursor-pointer disabled:opacity-50"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            );
        }

        // Product NOT in cart — show Add to Cart button
        return (
            <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`w-full border border-[#7A1F3D] bg-white py-3 sm:py-4 text-[13px] sm:text-[15px] font-bold uppercase tracking-widest text-[#7A1F3D] transition-all duration-300 hover:bg-[#7A1F3D] hover:text-white cursor-pointer rounded-sm active:scale-95 flex items-center justify-center gap-2 ${isAdding ? "opacity-70 cursor-not-allowed" : ""}`}
            >
                {isAdding ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Adding...
                    </>
                ) : (
                    <>
                        <ShoppingBag size={16} />
                        Add To Cart
                    </>
                )}
            </button>
        );
    };

    return (
        <div className="h-full w-full font-gt-walsheim relative flex flex-col items-center lg:items-start text-center lg:text-left px-4 sm:px-6 lg:px-0">
            {/* Background Watermark */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] sm:w-[350px] sm:h-[350px] lg:w-[400px] lg:h-[400px] bg-contain bg-no-repeat bg-center z-[-1] opacity-[0.03] sm:opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: 'url("https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856924/Where%20Devotion%20Meets%20Royal%20Elegance.png")' }}
            />

            <div className="w-full">
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
                                onClick={() => {
                                    setSelectedSize(size);
                                    setQuantity(1);
                                }}
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

                {/* Only show separate quantity picker if NOT yet in cart */}
                {cartQty === 0 && (
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
                                disabled={quantity >= (Number(variation?.quantity || variation?.stock || 1))}
                                className="flex h-full w-9 sm:w-10 items-center justify-center text-[#303030] hover:bg-gray-50 transition cursor-pointer text-base sm:text-lg disabled:opacity-50"
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-6 sm:mt-7 w-full">
                    <p className="mb-2 sm:mb-3 text-[13px] sm:text-[14px] font-semibold text-[#303030]">Select Color</p>
                    <div className="flex gap-3 sm:gap-4 justify-center lg:justify-start">
                        {product.colors.map((color) => (
                            <button
                                key={color}
                                onClick={() => handleColorChange(color)}
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
            </div>

            <div className="mt-auto pt-8 sm:pt-10 w-full lg:max-w-[320px] space-y-3.5 sm:space-y-4">
                {renderCartButton()}

                {message.text && (
                    <p className={`text-center text-[12px] font-medium mt-2 p-2 rounded-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    );
}