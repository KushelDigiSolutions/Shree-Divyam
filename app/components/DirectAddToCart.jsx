"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Plus, Minus } from "lucide-react";
import { addToCart, updateCartItemQuantity, removeCartItem, getCartItemQuantity } from "../utils/cartUtils";

/**
 * A reusable "Add to Cart" button that adds the product directly
 * without redirecting to another page. Shows quantity controls if already in cart.
 */
export default function DirectAddToCart({ product, className = "" }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [activeVariantId, setActiveVariantId] = useState(null);

  const getQuantityData = () => getCartItemQuantity(product);

  useEffect(() => {
    const data = getQuantityData();
    setQuantity(data.quantity);
    setActiveVariantId(data.variantId);
    
    const handleUpdateEvent = () => {
        const newData = getQuantityData();
        setQuantity(newData.quantity);
        setActiveVariantId(newData.variantId);
    };
    
    window.addEventListener("cartUpdated", handleUpdateEvent);
    window.addEventListener("storage", handleUpdateEvent);
    return () => {
        window.removeEventListener("cartUpdated", handleUpdateEvent);
        window.removeEventListener("storage", handleUpdateEvent);
    }
  }, [product.id, product.product_id, product.productID, product.slug]);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;
    setIsAdding(true);
    setError("");
    setShowSuccess(false);

    const result = await addToCart(product);

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setError(result.message);
      setTimeout(() => setError(""), 4000);
    }
    
    setIsAdding(false);
  };

  const handleUpdate = async (e, newQuantity) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isUpdating) return;
    
    setIsUpdating(true);
    setError("");
    setShowSuccess(false); // Clear the success state so it doesn't linger
    
    // Instantly update local UI
    setQuantity(newQuantity);
    
    // Run the API in the background
    (async () => {
        if (newQuantity < 1) {
            const result = await removeCartItem(product, activeVariantId);
            if (!result.success) {
                setError(result.message);
                setTimeout(() => setError(""), 4000);
            }
        } else {
            const result = await updateCartItemQuantity(product, newQuantity, activeVariantId);
            if (!result.success) {
                setError(result.message);
                setTimeout(() => setError(""), 4000);
            }
        }
        setIsUpdating(false);
    })();
  };

  if (quantity > 0) {
    return (
      <div className={`relative w-full h-[42px] flex items-center justify-between border border-[#7A1F3D] text-[#7A1F3D] px-2 ${className}`}>
        <button 
          onClick={(e) => handleUpdate(e, quantity - 1)}
          disabled={isUpdating}
          className="w-8 h-8 flex items-center justify-center hover:bg-[#7A1F3D] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#7A1F3D] cursor-pointer rounded-full"
        >
          <Minus size={16} />
        </button>
        
        <div className="flex items-center gap-2">
            {isUpdating && <Loader2 size={12} className="animate-spin text-[#7A1F3D]" />}
            <span className="font-bold text-[14px]">{quantity}</span>
        </div>
        
        <button 
          onClick={(e) => handleUpdate(e, quantity + 1)}
          disabled={isUpdating}
          className="w-8 h-8 flex items-center justify-center hover:bg-[#7A1F3D] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#7A1F3D] cursor-pointer rounded-full"
        >
          <Plus size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <button
        onClick={handleAdd}
        disabled={isAdding}
        className={`w-full h-[42px] border border-[#7A1F3D] text-[13px] md:text-[14px] font-medium transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
          showSuccess 
            ? "bg-green-600 border-green-600 text-white" 
            : error 
              ? "bg-red-500 border-red-500 text-white"
              : "text-[#7A1F3D] hover:bg-[#7A1F3D] hover:text-white"
        } ${className}`}
      >
        {isAdding ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Adding...</span>
          </>
        ) : showSuccess ? (
          <>
            <CheckCircle2 size={16} />
            <span>Added!</span>
          </>
        ) : error ? (
          <span>{error.length > 15 ? "Error" : error}</span>
        ) : (
          "Add to Cart"
        )}
      </button>
    </div>
  );
}
