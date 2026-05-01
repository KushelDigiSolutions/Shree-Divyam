"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, User, Phone, MapPin, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { RxCross2 } from "react-icons/rx";

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        state: "",
        email: "",
        password: "",
        password_confirmation: "",
        mobile_number: "",
    });

    const [errors, setErrors] = useState({});

    const validateField = (name, value) => {
        let error = "";
        const stringValue = value ? value.toString().trim() : "";

        if (!stringValue) {
            error = `${name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} is required`;
        } else {
            if (name === "first_name" || name === "last_name" || name === "state") {
                if (stringValue.length < 2) {
                    error = "Must be at least 2 characters";
                } else if (!/^[A-Za-z\s]+$/.test(stringValue)) {
                    error = "Alphabet required";
                }
            }

            if (name === "email") {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(stringValue)) error = "Please enter a valid email address";
            }
            if (name === "mobile_number") {
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(stringValue)) error = "10-digit number required";
            }
            if (name === "password") {
                if (stringValue.length < 8) {
                    error = "Password must be at least 8 characters";
                } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(stringValue)) {
                    error = "Must include uppercase, lowercase, and a number";
                }
            }
            if (name === "password_confirmation" && stringValue !== formData.password) {
                error = "Passwords do not match";
            }
        }
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
        // Special case: if password confirmation was erroring due to mismatch, re-validate it when password changes
        if (name === "password" && errors.password_confirmation) {
            setErrors(prev => ({ ...prev, password_confirmation: "" }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setStatus({ type: "error", message: "Please fill in all required fields." });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsLoading(true);
        setStatus({ type: "", message: "" });

        const REGISTER_API = "/api/proxy/registration";

        try {
            const response = await fetch(REGISTER_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    username: formData.email // Use email as username for API compatibility
                }),
            });

            const data = await response.json();
            console.log("Registration Response:", data);

            // Stricter check for errors based on the response you provided
            // data.status is false (boolean) and data.status_code is 400
            const isError = !response.ok ||
                data.status === false ||
                data.status === "error" ||
                data.success === false ||
                data.status_code >= 400 ||
                (data.message && typeof data.message === 'object' && !Array.isArray(data.message)) ||
                (data.errors);

            if (!isError) {
                setStatus({ type: "success", message: "Registration successful! Redirecting to login..." });
                setTimeout(() => router.push("/login"), 2000);
            } else {
                // Extract the best error message possible from the object structure you showed
                let errorMsg = "Registration failed. Please try again.";

                if (typeof data.message === 'string') {
                    errorMsg = data.message;
                } else if (data.message && typeof data.message === 'object') {
                    // Combine all errors from the object (e.g., email and username)
                    const errorLines = Object.values(data.message).map(val =>
                        Array.isArray(val) ? val[0] : String(val)
                    );
                    errorMsg = errorLines.join(" ");
                } else if (data.errors) {
                    const errorLines = Object.values(data.errors).map(val =>
                        Array.isArray(val) ? val[0] : String(val)
                    );
                    errorMsg = errorLines.join(" ");
                }

                setStatus({ type: "error", message: errorMsg });
            }
        } catch (error) {
            console.error("Registration Error:", error);
            setStatus({ type: "error", message: "Network error. Please try again later." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="bg-white min-h-screen flex flex-col font-primary">
            <Header />

            <div className="flex-1 flex items-center justify-center bg-[#F9F7F5] pt-10 pb-20 px-4 sm:px-6">
                <div className="w-full max-w-[700px] bg-white border border-[#E8DDD4] p-6 sm:p-12 shadow-2xl rounded-sm">

                    <div className="text-center mb-10">
                        <h1 className="text-2xl sm:text-4xl font-playfair font-bold text-[#303030] mb-3">Create Account</h1>
                        <p className="text-sm text-gray-500 italic">Join the Shri Divyam family for a blessed experience</p>
                    </div>

                    {status.message && (
                        <div className={`mb-8 p-5 rounded-sm flex items-start gap-3 animate-in fade-in zoom-in duration-300 ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            {status.type === "success" ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
                            <p className="text-sm font-medium leading-tight">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* First Name */}
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">First Name</label>
                                <div className="relative group">
                                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.first_name ? "text-red-400" : "text-gray-400 group-focus-within:text-[#7A1F3D]"}`} size={16} />
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        // onKeyDown={(e) => {
                                        //     if (!/^[A-Za-z\s]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                        //         e.preventDefault();
                                        //     }
                                        // }}
                                        placeholder="First Name"
                                        className={`w-full pl-10 pr-10 py-3 border outline-none transition-all duration-300 rounded-sm text-sm ${errors.first_name ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"} text-gray-800`}
                                    />
                                    {formData.first_name && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, first_name: "" }))}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <RxCross2  size={14} />
                                        </button>
                                    )}
                                </div>
                                {errors.first_name && <p className="text-[11px] text-red-600 font-medium mt-1 animate-in slide-in-from-top-1">{errors.first_name}</p>}
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">Last Name</label>
                                <div className="relative group">
                                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.last_name ? "text-red-400" : "text-gray-400 group-focus-within:text-[#7A1F3D]"}`} size={16} />
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        // onKeyDown={(e) => {
                                        //     if (!/^[A-Za-z\s]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                        //         e.preventDefault();
                                        //     }
                                        // }}
                                        placeholder="Last Name"
                                        className={`w-full pl-10 pr-10 py-3 border outline-none transition-all duration-300 rounded-sm text-sm ${errors.last_name ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"} text-gray-800`}
                                    />
                                    {formData.last_name && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, last_name: "" }))}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <RxCross2  size={14} />
                                        </button>
                                    )}
                                </div>
                                {errors.last_name && <p className="text-[11px] text-red-600 font-medium mt-1 animate-in slide-in-from-top-1">{errors.last_name}</p>}
                            </div>



                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">Email Address</label>
                                <div className="relative group">
                                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.email ? "text-red-400" : "text-gray-400 group-focus-within:text-[#7A1F3D]"}`} size={16} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder="Email Address"
                                        className={`w-full pl-10 pr-10 py-3 border outline-none transition-all duration-300 rounded-sm text-sm ${errors.email ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"} text-gray-800`}
                                    />
                                    {formData.email && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, email: "" }))}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <RxCross2  size={14} />
                                        </button>
                                    )}
                                </div>
                                {errors.email && <p className="text-[11px] text-red-600 font-medium mt-1 animate-in slide-in-from-top-1">{errors.email}</p>}
                            </div>

                            {/* Mobile Number */}
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">Mobile Number</label>
                                <div className="relative group">
                                    <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.mobile_number ? "text-red-400" : "text-gray-400 group-focus-within:text-[#7A1F3D]"}`} size={16} />
                                    <input
                                        type="tel"
                                        name="mobile_number"
                                        value={formData.mobile_number}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        // onKeyDown={(e) => {
                                        //     if (!/^[0-9]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                        //         e.preventDefault();
                                        //     }
                                        // }}
                                        inputMode="numeric"
                                        maxLength={10}
                                        placeholder="10-digit number"
                                        className={`w-full pl-10 pr-10 py-3 border outline-none transition-all duration-300 rounded-sm text-sm ${errors.mobile_number ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"} text-gray-800`}
                                    />
                                    {formData.mobile_number && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, mobile_number: "" }))}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <RxCross2  size={14} />
                                        </button>
                                    )}
                                </div>
                                {errors.mobile_number && <p className="text-[11px] text-red-600 font-medium mt-1 animate-in slide-in-from-top-1">{errors.mobile_number}</p>}
                            </div>

                            {/* State */}
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">State</label>
                                <div className="relative group">
                                    <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.state ? "text-red-400" : "text-gray-400 group-focus-within:text-[#7A1F3D]"}`} size={16} />
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        // onKeyDown={(e) => {
                                        //     if (!/^[A-Za-z\s]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                        //         e.preventDefault();
                                        //     }
                                        // }}
                                        placeholder="e.g. Maharashtra"
                                        className={`w-full pl-10 pr-10 py-3 border outline-none transition-all duration-300 rounded-sm text-sm ${errors.state ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"} text-gray-800`}
                                    />
                                    {formData.state && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, state: "" }))}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <RxCross2  size={14} />
                                        </button>
                                    )}
                                </div>
                                {errors.state && <p className="text-[11px] text-red-600 font-medium mt-1 animate-in slide-in-from-top-1">{errors.state}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">Password</label>
                                    {!errors.password && <span className="text-[9px] text-gray-400 font-medium italic">Min 8 chars, A-z, 0-9</span>}
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
                                        className={`w-full pl-10 pr-10 py-3 border outline-none transition-all duration-300 rounded-sm text-sm ${errors.password ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"} text-gray-800`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7A1F3D] transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-[11px] text-red-600 font-medium mt-1 animate-in slide-in-from-top-1">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.password_confirmation ? "text-red-400" : "text-gray-400 group-focus-within:text-[#7A1F3D]"}`} size={16} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder="••••••••"
                                        className={`w-full pl-10 pr-10 py-3 border outline-none transition-all duration-300 rounded-sm text-sm ${errors.password_confirmation ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"} text-gray-800`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7A1F3D] transition-colors p-1"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password_confirmation && <p className="text-[11px] text-red-600 font-medium mt-1 animate-in slide-in-from-top-1">{errors.password_confirmation}</p>}
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 bg-[#7A1F3D] text-white font-bold uppercase tracking-[0.25em] text-xs shadow-xl hover:bg-[#5E182F] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 rounded-sm ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </div>

                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-[13px] text-gray-500 mb-4">Already have an account?</p>
                        <Link href="/login" className="text-[#7A1F3D] font-bold uppercase tracking-[0.2em] text-xs  inline-block border border-[#7A1F3D]/20 px-6 py-2 hover:bg-[#7A1F3D]/5 transition-colors">
                            Sign In
                        </Link>
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
