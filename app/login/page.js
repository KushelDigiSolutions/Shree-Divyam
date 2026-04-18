"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Loader2, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({ username: "", password: "" });

    const validateField = (name, value) => {
        let error = "";
        if (!value.trim()) {
            error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        } else if (name === "password" && value.length < 6) {
            error = "Password must be at least 6 characters";
        }
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error as user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation check before submission
        const usernameError = validateField("username", formData.username);
        const passwordError = validateField("password", formData.password);

        if (usernameError || passwordError) {
            setErrors({
                username: usernameError,
                password: passwordError
            });
            return;
        }

        setIsLoading(true);
        setStatus({ type: "", message: "" });

        const LOGIN_API = "https://shreedivyam.kdscrm.com/api/login";

        try {
            const response = await fetch(LOGIN_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            const isSuccess = response.ok && data.status !== 'error' && data.success !== false;

            if (isSuccess) {
                const token = data.token || data.user?.access_token || data.access_token;
                let userObj = data.user || {};

                if (token && !userObj.id && !userObj.user_id) {
                    try {
                        const base64Url = token.split('.')[1];
                        if (base64Url) {
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                            }).join(''));
                            const decoded = JSON.parse(jsonPayload);
                            const id = decoded.sub || decoded.id || decoded.user_id;
                            if (id) {
                                userObj = { ...userObj, id: id, username: decoded.username || formData.username };
                            }
                        }
                    } catch (e) {
                        console.error("Failed to decode JWT", e);
                    }
                }

                const userToStore = (userObj && typeof userObj === 'object' && Object.keys(userObj).length > 0) ? userObj : formData.username;
                login(userToStore, token || "dummy-token-for-now");
                setStatus({ type: "success", message: "Login successful!" });
                setTimeout(() => router.push("/"), 1500);
            } else {
                setStatus({ type: "error", message: data.message || data.error || "Invalid username or password." });
            }
        } catch (error) {
            console.error("Login Error:", error);
            setStatus({ type: "error", message: `System Error: ${error.message || "Please try again later."}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="bg-white min-h-screen flex flex-col">
            <Header />
            
            <div className="flex-1 flex items-center justify-center bg-[#F9F7F5] pt-10 pb-20 px-4 sm:px-6 font-primary">
                <div className="w-full max-w-[420px] bg-white border border-[#E8DDD4] p-8 sm:p-10 shadow-2xl rounded-sm">
                    
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-[#303030] mb-3">Welcome Back</h1>
                        <p className="text-sm text-gray-500 italic">Sign in to continue your divine journey</p>
                    </div>

                    {status.message && (
                        <div className={`mb-6 p-4 rounded-sm flex items-start gap-3 animate-in fade-in zoom-in duration-300 ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            {status.type === "success" ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                            <p className="text-[13px] font-medium leading-tight">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">Username</label>
                            <div className="relative group">
                                <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.username ? "text-red-400" : "text-gray-400 group-focus-within:text-[#7A1F3D]"}`} size={16} />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter your username"
                                    className={`w-full pl-10 pr-4 py-3 border outline-none transition-all duration-300 rounded-sm text-sm ${errors.username ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-100" : "border-gray-200 focus:border-[#7A1F3D] focus:shadow-sm"} text-gray-800`}
                                />
                            </div>
                            {errors.username && (
                                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-top-1">
                                    <AlertCircle size={12} /> {errors.username}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">Password</label>
                                <a href="#" className="text-[11px] text-[#7A1F3D] hover:underline font-bold uppercase tracking-wider">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.password ? "text-red-400" : "text-gray-400 group-focus-within:text-[#7A1F3D]"}`} size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-12 py-3 border outline-none transition-all duration-300 rounded-sm text-sm ${errors.password ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-100" : "border-gray-200 focus:border-[#7A1F3D] focus:shadow-sm"} text-gray-800`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7A1F3D] transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-top-1">
                                    <AlertCircle size={12} /> {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 bg-[#7A1F3D] text-white font-bold uppercase tracking-[0.25em] text-xs shadow-xl hover:bg-[#5E182F] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 rounded-sm ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Verifying...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-[13px] text-gray-500 mb-4">New to Shri Divyam?</p>
                        <Link href="/register" className="text-[#7A1F3D] font-bold uppercase tracking-[0.2em] text-xs hover:underline inline-block border border-[#7A1F3D]/20 px-6 py-2 hover:bg-[#7A1F3D]/5 transition-colors">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
