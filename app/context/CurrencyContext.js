"use client";

import { createContext, useContext, useState } from "react";

const CurrencyContext = createContext();

// 1 USD = ~94 INR (approximate fixed rate)
export const USD_TO_INR = 94;

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("INR"); // default INR

  const toggleCurrency = (val) => setCurrency(val);

  const formatPrice = (inrPrice, usdPrice) => {
    if (currency === "USD") {
      if (usdPrice) return `$ ${usdPrice}`;

      const price = parseFloat(inrPrice);
      if (isNaN(price)) return inrPrice;
      return `$ ${(price / USD_TO_INR).toFixed(2)}`;
    }
    return `₹ ${inrPrice}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
