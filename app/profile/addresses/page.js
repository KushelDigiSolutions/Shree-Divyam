"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Plus, MapPin, Phone, User, Globe, Home, Landmark, Trash2, CheckCircle, Loader2, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

export default function MyAddressesPage() {
    const router = useRouter();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        country: "India",
        address1: "",
        address2: "",
        landmark: "",
        phone: "",
        city: "",
        state: "",
        zipcode: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchAddresses();
    }, [router]);

    const fetchAddresses = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            console.log("Fetching addresses in Profile...");
            const endpoints = ["/api/proxy/address", "/api/proxy/address/list"];
            let list = [];

            for (const url of endpoints) {
                const response = await fetch(url, {
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`Profile Address API (${url}) response:`, data);
                    const foundList = data.addresses || data.data || (Array.isArray(data) ? data : []);
                    if (Array.isArray(foundList) && foundList.length > 0) {
                        list = foundList;
                        break;
                    }
                }
            }

            console.log("Final profile address list:", list);
            setAddresses(list);
        } catch (err) {
            console.error("Profile Address fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const validateField = (name, value) => {
        let error = "";
        const stringValue = value ? String(value).trim() : "";
        const optionalFields = ["address2", "landmark"];

        // Required Check
        if (!stringValue && !optionalFields.includes(name)) {
            const fieldLabel = name.replace(/_/g, ' ').replace(/\d/g, '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `${fieldLabel} is required`;
        }

        if (stringValue) {
            if (name === "first_name" || name === "last_name" || name === "city" || name === "state") {
                if (stringValue.length < 2) {
                    error = "Must be at least 2 characters";
                } else if (!/^[A-Za-z\s.]+$/.test(stringValue)) {
                    error = "Only alphabets are allowed";
                }
            } else if (name === "phone") {
                if (!/^\d{10}$/.test(stringValue)) {
                    error = "Please enter a valid 10-digit mobile number";
                }
            } else if (name === "zipcode") {
                if (!/^\d{6}$/.test(stringValue)) {
                    error = "Valid 6-digit zipcode required";
                }
            } else if (name === "address1") {
                if (stringValue.length < 5) {
                    error = "Please provide a more complete address (min 5 chars)";
                }
            }
        }
        return error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem("token");

        try {
            console.log("Storing new address from Profile...", formData);
            const response = await fetch("/api/proxy/address/store", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log("Store Address Response:", data);

            if (response.ok) {
                setStatus({ type: "success", message: "Address saved successfully!" });
                setIsAddingNew(false);
                setFormData({
                    first_name: "", last_name: "", country: "India",
                    address1: "", address2: "", landmark: "",
                    phone: "", city: "", state: "", zipcode: ""
                });
                fetchAddresses();
            } else {
                // If it fails, try with trailing slash as some APIs require it
                console.log("Retrying with trailing slash...");
                const retryRes = await fetch("/api/proxy/address/store/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                
                if (retryRes.ok) {
                    setStatus({ type: "success", message: "Address saved successfully!" });
                    setIsAddingNew(false);
                    setFormData({
                        first_name: "", last_name: "", country: "India",
                        address1: "", address2: "", landmark: "",
                        phone: "", city: "", state: "", zipcode: ""
                    });
                    fetchAddresses();
                } else {
                    const retryData = await retryRes.json();
                    setStatus({ type: "error", message: data.message || retryData.message || "Failed to save address" });
                }
            }
        } catch (err) {
            console.error("Store Address Error:", err);
            setStatus({ type: "error", message: "Network error. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        setIsLoading(true);
        const token = localStorage.getItem("token");

        try {
            // Using the proxy to avoid CORS
            const response = await fetch(`/api/proxy/deleteaddress/${addressId}`, {
                method: "DELETE", // We'll try DELETE first
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setStatus({ type: "success", message: "Address deleted successfully!" });
                fetchAddresses();
            } else {
                // If DELETE fails, try GET as some legacy APIs use GET for delete actions
                const retryRes = await fetch(`/api/proxy/deleteaddress/${addressId}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (retryRes.ok) {
                    setStatus({ type: "success", message: "Address deleted successfully!" });
                    fetchAddresses();
                } else {
                    setStatus({ type: "error", message: "Failed to delete address. Please try again." });
                }
            }
        } catch (err) {
            console.error("Delete Address Error:", err);
            setStatus({ type: "error", message: "Network error while deleting address." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="bg-white min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 bg-[#F9F7F5] py-12 px-4 sm:px-6">
                <div className="max-w-[1000px] mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-2">
                                <Link href="/" className="hover:text-[#7A1F3D]">Home</Link>
                                <span>/</span>
                                <span className="text-[#303030] font-medium">My Addresses</span>
                            </div>
                            <h1 className="text-3xl font-playfair font-bold text-[#303030]">Manage Addresses</h1>
                            <p className="text-sm text-gray-500 mt-1 italic">Save your shipping details for faster checkout</p>
                        </div>

                        {!isAddingNew && (
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="flex items-center justify-center gap-2 bg-[#7A1F3D] text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-[11px] hover:bg-[#5E182F] transition-all shadow-lg active:scale-95"
                            >
                                <Plus size={16} />
                                Add New Address
                            </button>
                        )}
                    </div>

                    {status.message && (
                        <div className={`mb-8 p-4 rounded-sm flex items-start gap-3 animate-in fade-in duration-300 ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            <CheckCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{status.message}</p>
                            <button onClick={() => setStatus({ type: "", message: "" })} className="ml-auto text-current opacity-50 hover:opacity-100">×</button>
                        </div>
                    )}

                    {isAddingNew ? (
                        <div className="bg-white border border-[#E8DDD4] p-6 sm:p-10 shadow-xl rounded-sm animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-playfair font-bold text-[#303030]">New Shipping Address</h2>
                                <button onClick={() => setIsAddingNew(false)} className="text-gray-400 hover:text-[#7A1F3D] transition flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest">
                                    <ArrowLeft size={14} /> Cancel
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} onBlur={handleBlur} placeholder="First Name" className={`w-full pl-10 pr-4 py-3 border rounded-sm text-sm outline-none transition-all ${errors.first_name ? "border-red-300 bg-red-50/20" : "border-gray-200 focus:border-[#7A1F3D]"}`} />
                                        </div>
                                        {errors.first_name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.first_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Last Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} onBlur={handleBlur} placeholder="Last Name" className={`w-full pl-10 pr-4 py-3 border rounded-sm text-sm outline-none transition-all ${errors.last_name ? "border-red-300 bg-red-50/20" : "border-gray-200 focus:border-[#7A1F3D]"}`} />
                                        </div>
                                        {errors.last_name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.last_name}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Country</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <select name="country" value={formData.country} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm text-sm outline-none focus:border-[#7A1F3D] appearance-none bg-white">
                                            <option value="India">India</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Address Line 1</label>
                                        <div className="relative">
                                            <Home className="absolute left-3 top-3 text-gray-300" size={16} />
                                            <input type="text" name="address1" value={formData.address1} onChange={handleInputChange} onBlur={handleBlur} placeholder="House No., Building, Street" className={`w-full pl-10 pr-4 py-3 border rounded-sm text-sm outline-none transition-all ${errors.address1 ? "border-red-300 bg-red-50/20" : "border-gray-200 focus:border-[#7A1F3D]"}`} />
                                        </div>
                                        {errors.address1 && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.address1}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Address Line 2 (Optional)</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input type="text" name="address2" value={formData.address2} onChange={handleInputChange} placeholder="Apartment, Suite, Unit, etc." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm text-sm outline-none focus:border-[#7A1F3D]" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Landmark / Suite (Optional)</label>
                                        <div className="relative">
                                            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange} placeholder="Near By" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm text-sm outline-none focus:border-[#7A1F3D]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">City</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} onBlur={handleBlur} placeholder="City" className={`w-full px-4 py-3 border rounded-sm text-sm outline-none transition-all ${errors.city ? "border-red-300 bg-red-50/20" : "border-gray-200 focus:border-[#7A1F3D]"}`} />
                                        {errors.city && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">State</label>
                                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} onBlur={handleBlur} placeholder="State" className={`w-full px-4 py-3 border rounded-sm text-sm outline-none transition-all ${errors.state ? "border-red-300 bg-red-50/20" : "border-gray-200 focus:border-[#7A1F3D]"}`} />
                                        {errors.state && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.state}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Zipcode</label>
                                        <input type="text" name="zipcode" maxLength={6} value={formData.zipcode} onChange={handleInputChange} onBlur={handleBlur} placeholder="Zipcode (6 digits)" className={`w-full px-4 py-3 border rounded-sm text-sm outline-none transition-all ${errors.zipcode ? "border-red-300 bg-red-50/20" : "border-gray-200 focus:border-[#7A1F3D]"}`} />
                                        {errors.zipcode && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.zipcode}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Contact Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input type="tel" name="phone" maxLength={10} value={formData.phone} onChange={handleInputChange} onBlur={handleBlur} placeholder="10-digit Phone Number (e.g. 9876543210)" className={`w-full pl-10 pr-4 py-3 border rounded-sm text-sm outline-none transition-all ${errors.phone ? "border-red-300 bg-red-50/20" : "border-gray-200 focus:border-[#7A1F3D]"}`} />
                                        </div>
                                        {errors.phone && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.phone}</p>}
                                    </div>
                                </div>

                                <button
                                    disabled={isLoading}
                                    className="w-full py-4 bg-[#7A1F3D] text-white font-bold uppercase tracking-widest text-[11px] rounded-sm hover:bg-[#5E182F] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Save Address</>}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isLoading ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-[#E8DDD4] rounded-sm">
                                    <Loader2 size={40} className="text-[#7A1F3D] animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium italic">Loading your saved addresses...</p>
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-[#E8DDD4] rounded-sm text-center px-6">
                                    <MapPin size={48} className="text-gray-200 mb-6" />
                                    <h3 className="text-xl font-playfair font-bold text-[#303030] mb-2">No Saved Addresses</h3>
                                    <p className="text-gray-500 max-w-sm mb-8">You haven't saved any addresses yet. Add one now to make your next purchase even faster.</p>
                                    <button
                                        onClick={() => setIsAddingNew(true)}
                                        className="bg-[#7A1F3D] text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-[11px] hover:bg-[#5E182F] transition-all"
                                    >
                                        Add Your First Address
                                    </button>
                                </div>
                            ) : (
                                addresses.map((addr, idx) => (
                                    <div key={addr.id || idx} className="bg-white border border-[#E8DDD4] p-6 rounded-sm shadow-sm hover:shadow-md transition-all group relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 bg-[#FDF8F3] text-[#7A1F3D] rounded-full flex items-center justify-center">
                                                <Home size={18} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {addr.is_default && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-600 px-2 py-1 rounded-sm border border-green-100">Default</span>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                    className="text-gray-300 hover:text-red-500 transition p-1"
                                                    title="Delete Address"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-[#303030] text-lg mb-1">{addr.first_name} {addr.last_name}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                            {addr.address1}, {addr.address2 && `${addr.address2}, `}
                                            {addr.landmark && `${addr.landmark}, `}
                                            {addr.city}, {addr.state} - {addr.zipcode}
                                        </p>

                                        <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                <Phone size={14} className="text-[#7A1F3D]/40" />
                                                {addr.phone}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                <Globe size={14} className="text-[#7A1F3D]/40" />
                                                {addr.country}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
