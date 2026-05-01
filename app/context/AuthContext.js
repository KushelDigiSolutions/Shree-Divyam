"use client";

import { createContext, useContext, useState, useEffect } from "react";

import { syncGuestCartToUser } from "../utils/cartUtils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load token from localStorage on mount
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                }
            }
        }
        setLoading(false);
    }, []);

    const login = async (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Sync any guest cart items to the newly logged-in account
        const userId = userData.id || userData.user_id || userData.userid || "1";
        await syncGuestCartToUser(userToken, String(userId));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Clear cart state so stale data doesn't pollute the next guest/login session
        localStorage.removeItem("shri_divyam_cart_quantities");
        localStorage.removeItem("shri_divyam_removed_cart_items");
        localStorage.removeItem("shri_divyam_guest_cart");
        window.dispatchEvent(new Event("cartUpdated"));
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoggedIn: !!token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
