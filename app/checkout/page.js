"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Loader2, ArrowLeft, ShieldCheck, Truck, CheckCircle, MapPin, Phone, User, Home, Globe, Landmark, Mail, Plus } from "lucide-react";
import Link from "next/link";
import { useCurrency } from "../context/CurrencyContext";
import { products as staticProducts } from "../data/products";

export default function CheckoutPage() {
    const router = useRouter();
    const { formatPrice } = useCurrency();
    // --- localStorage helpers for persistent cart synchronization ---
    const REMOVED_ITEMS_KEY = "shri_divyam_removed_cart_items";
    const CART_QUANTITIES_KEY = "shri_divyam_cart_quantities";

    const getRemovedItems = () => {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem(REMOVED_ITEMS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) { return []; }
    };

    const isItemRemoved = (item) => {
        const removed = getRemovedItems();
        if (!removed || removed.length === 0) return false;

        // Check all possible ID fields to ensure we match what My Bag saved
        const possiblePIds = [
            item.product_id,
            item.id,
            item.cart_item_id,
            item.row_id,
            item.product?.id
        ].filter(Boolean).map(String);

        const vId = String(item.variant_id || item.variation_id || item.variation?.id || item.variant?.id || "");

        return removed.some(r => {
            // If the saved pId matches any of our possible IDs
            const pIdMatches = possiblePIds.includes(String(r.pId));
            if (!pIdMatches) return false;

            // If variant info exists in both, they must match. 
            // If only one has it, we assume it's a match by product.
            if (r.vId && vId && r.vId !== "undefined" && vId !== "undefined") {
                return String(r.vId) === vId;
            }
            return true;
        });
    };

    const getSavedQuantities = () => {
        try {
            const stored = localStorage.getItem(CART_QUANTITIES_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) { return {}; }
    };

    const getItemKey = (item) => {
        const productId = item.product_id || item.id;
        const variantId = item.variant_id || item.variation_id || item.variation?.id || item.variant?.id || '';
        return `${productId}_${variantId}`;
    };

    const [isLoading, setIsLoading] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [isFetchingCart, setIsFetchingCart] = useState(true);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [activeStep, setActiveStep] = useState(1); // 1: Shipping, 2: Payment
    const [isSyncing, setIsSyncing] = useState(false);

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
        zipcode: "",
        save_address: true
    });

    const [errors, setErrors] = useState({});
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const res = await fetch("/api/proxy/cart", {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const text = await res.text();
                let data = {};
                if (text) {
                    try {
                        data = JSON.parse(text);
                    } catch (e) { }
                }

                if (res.ok) {
                    const rawItems = data.cart_items || data.cart || data.items || data.data || [];
                    let parsedItems = [];

                    if (Array.isArray(rawItems)) {
                        parsedItems = rawItems;
                    } else if (rawItems && typeof rawItems === 'object') {
                        // Support transformed response from proxy (_original_items)
                        parsedItems = rawItems._original_items || (Array.isArray(rawItems.items) ? rawItems.items : []);
                    }

                    // --- AGGRESSIVE AUTO-CLEANUP START ---
                    const ghostItems = parsedItems.filter(item => isItemRemoved(item));
                    if (ghostItems.length > 0) {
                        console.log(`🧹 Checkout Cleanup: Found ${ghostItems.length} ghost items on server.`);
                        const token = localStorage.getItem("token");
                        let userId = "";
                        try {
                            const userStr = localStorage.getItem("user");
                            if (userStr) {
                                const userData = JSON.parse(userStr);
                                userId = userData.id || userData.user_id || userData.userid || "";
                            }
                        } catch (e) { }
                        if (!userId) userId = "1";

                        ghostItems.forEach(async (item) => {
                            const itemId = item.id || item.cart_item_id || item.row_id || item.cart_id;
                            const pId = item.product_id || item.id;
                            const vId = item.variant_id || item.variation_id;

                            const strategies = [
                                () => fetch(`/api/proxy/cart/remove`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                                    body: JSON.stringify({ cart_item_id: itemId, id: itemId, product_id: pId, variation_id: vId, user_id: String(userId) })
                                }),
                                () => fetch(`/api/proxy/cart/remove/${itemId || pId}`, {
                                    method: "DELETE",
                                    headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
                                }),
                                () => fetch(`/api/proxy/cart/delete`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                                    body: JSON.stringify({ cart_item_id: itemId, product_id: pId, user_id: String(userId) })
                                })
                            ];

                            for (const strategy of strategies) {
                                try {
                                    const res = await strategy();
                                    if (res.ok) { console.log(`✅ Checkout Cleanup: Successfully removed item ${pId} from server`); break; }
                                } catch (e) { }
                            }
                        });
                    }
                    // --- AGGRESSIVE AUTO-CLEANUP END ---

                    // --- ENRICHMENT START (Optimized with local data) ---
                    const enrichItems = async (items) => {
                        try {
                            if (staticProducts && staticProducts.length > 0) {
                                setCartItems(prev => {
                                    return prev.map(item => {
                                        const pId = item.product_id || item.id;
                                        const found = staticProducts.find(p => String(p.id) === String(pId));
                                        if (found) {
                                            return { 
                                                ...item, 
                                                product_id: item.product_id || found.id, 
                                                product_name: item.product_name || found.title || found.name, 
                                                price: item.price || found.price,
                                                image_path: item.image_path || found.image
                                            };
                                        }
                                        return item;
                                    });
                                });
                            }
                            
                            // Fetch dynamic products for missing items
                            setCartItems(prev => {
                                const missing = prev.filter(it => !it.product_name && !it.name);
                                if (missing.length > 0) {
                                    Promise.all([
                                        fetch('/api/proxy/products').then(r => r.ok ? r.json() : null).catch(() => null),
                                        fetch('/api/proxy/premium/products').then(r => r.ok ? r.json() : null).catch(() => null)
                                    ]).then(([allProds, premiumProds]) => {
                                        let pool = [];
                                        if (allProds && allProds.data) pool = [...pool, ...allProds.data];
                                        else if (allProds && allProds.products) pool = [...pool, ...allProds.products];
                                        else if (Array.isArray(allProds)) pool = [...pool, ...allProds];
                                        
                                        if (premiumProds && premiumProds.data) pool = [...pool, ...premiumProds.data];
                                        else if (premiumProds && premiumProds.products) pool = [...pool, ...premiumProds.products];
                                        else if (Array.isArray(premiumProds)) pool = [...pool, ...premiumProds];

                                        if (pool.length > 0) {
                                            setCartItems(curr => curr.map(item => {
                                                if (item.product_name || item.name) return item;
                                                const pId = item.product_id || item.id;
                                                const f = pool.find(p => String(p.id) === String(pId));
                                                if (f) {
                                                    return {
                                                        ...item,
                                                        product_name: item.product_name || item.name || f.name || f.title,
                                                        image_path: item.image_path || item.image || f.image_path || f.image,
                                                        price: item.price || f.price
                                                    };
                                                }
                                                return item;
                                            }));
                                        }
                                    }).catch(e => console.error(e));
                                }
                                return prev;
                            });
                        } catch (e) { console.error("Checkout enrichment error:", e); }
                    };
                    enrichItems(parsedItems);
                    // --- ENRICHMENT END ---

                    // TODO: Server-side cart cleanup will be added when remove API endpoint is provided

                    // Filter for UI
                    const filteredItems = parsedItems.filter(item => !isItemRemoved(item));
                    const savedQty = getSavedQuantities();
                    const itemsWithCorrectQty = filteredItems.map(item => {
                        const exactKey = getItemKey(item);
                        const apiQty = Number(item.quantity);
                        const pId = String(item.product_id || item.id || '');
                        
                        // Find any saved quantity for this product (handles case where API drops variant ID)
                        const matchingKey = Object.keys(savedQty).find(k => k === exactKey || k.startsWith(`${pId}_`));
                        
                        // 1. Priority: User's manual overrides
                        if (matchingKey && savedQty[matchingKey] !== undefined) {
                            return { ...item, quantity: savedQty[matchingKey] };
                        }
                        
                        // 2. Trust the API if valid
                        if (!isNaN(apiQty) && apiQty > 0) {
                            return { ...item, quantity: apiQty };
                        }
                        
                        // 3. Fallback
                        return { ...item, quantity: 1 };
                    });

                    setCartItems(itemsWithCorrectQty);
                }
            } catch (err) {
                console.error("Cart fetch error:", err);
            } finally {
                setIsFetchingCart(false);
            }
        };


        const fetchSavedAddresses = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("No token found, skipping address fetch");
                return;
            }

            try {
                console.log("Fetching addresses...");
                // Try both possible endpoints to be safe
                const endpoints = ["/api/proxy/address", "/api/proxy/address/list"];
                let list = [];

                for (const url of endpoints) {
                    const res = await fetch(url, {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Accept": "application/json"
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        console.log(`Address API (${url}) response:`, data);
                        const foundList = data.addresses || data.data || (Array.isArray(data) ? data : []);
                        if (Array.isArray(foundList) && foundList.length > 0) {
                            list = foundList;
                            break;
                        }
                    }
                }

                console.log("Final processed address list:", list);
                setSavedAddresses(list);

                if (list.length > 0) {
                    const defaultAddr = list.find(a => a.is_default) || list[0];
                    setSelectedAddressId(defaultAddr.id);
                    setIsAddingNewAddress(false);
                } else {
                    console.log("No saved addresses found, defaulting to 'Add New' form");
                    setIsAddingNewAddress(true);
                }
            } catch (err) {
                console.error("Address fetch error:", err);
                setIsAddingNewAddress(true);
            }
        };

        const loadUserData = () => {
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.first_name || user.name) {
                        setFormData(prev => ({
                            ...prev,
                            first_name: user.first_name || user.name.split(' ')[0] || "",
                            last_name: user.last_name || user.name.split(' ').slice(1).join(' ') || ""
                        }));
                    }
                }
            } catch (e) { }
        };

        fetchCart();
        fetchSavedAddresses();
        loadUserData();
    }, [router]);

    const validateField = (name, value) => {
        let error = "";
        const stringValue = value ? String(value).trim() : "";
        const optionalFields = ["address2", "landmark", "save_address"];

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
                // Simplified 10-digit phone number validation
                if (!/^\d{10}$/.test(stringValue)) {
                    error = "Please enter a valid 10-digit mobile number";
                }
            } else if (name === "zipcode") {
                // Indian Pincode: 6 digits
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

    const validate = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If adding new, validate the form
        if (isAddingNewAddress && !validate()) return;
        // If not adding new, ensure an address is selected
        if (!isAddingNewAddress && !selectedAddressId) {
            setStatus({ type: "error", message: "Please select a shipping address." });
            return;
        }

        setIsLoading(true);
        setStatus({ type: "", message: "" });

        const token = localStorage.getItem("token");

        try {
            let finalAddressId = selectedAddressId;

            // STEP 1: If it's a new address, store it first
            if (isAddingNewAddress) {
                try {
                    const addressResponse = await fetch("/api/proxy/address/store", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(formData)
                    });

                    const addressData = await addressResponse.json();
                    console.log("Address API Response:", addressData);

                    if (addressResponse.ok) {
                        finalAddressId = addressData.address_id || addressData.data?.id || addressData.id || 79;
                    } else {
                        throw new Error(addressData.message || "Failed to save new address");
                    }
                } catch (err) {
                    throw new Error("Address API error: " + err.message);
                }
            }

            // --- EXTREME PRE-ORDER CLEANUP ---
            console.log("🚀 Starting Extreme Pre-Order Cleanup...");
            
            let userId = "1";
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    userId = userData.id || userData.user_id || userData.userid || "1";
                }
            } catch (e) { }

            // --- DEEP AUDIT CLEANUP & SYNC ---
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    userId = userData.id || userData.user_id || userData.userid || userData.ID || "";
                }
            } catch (e) { }

            console.log("🔍 Deep Audit: User ID detected as:", userId);

            try {
                // 1. Fetch current server state to identify exactly what to purge
                const cartRes = await fetch("/api/proxy/cart", { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } });
                if (cartRes.ok) {
                    const cartData = await cartRes.json();
                    const serverItems = cartData.cart_items || cartData.cart?.items || cartData.items || [];
                    
                    // Identify items that are NOT in our current bag to purge them
                    const itemsToPurge = serverItems.filter(sItem => {
                        const sPId = String(sItem.product_id || sItem.id || "");
                        return !cartItems.some(cItem => String(cItem.product_id || cItem.id) === sPId);
                    });

                    if (itemsToPurge.length > 0) {
                        console.log(`🗑️ Purging ${itemsToPurge.length} unauthorized items from server...`);
                        await Promise.all(itemsToPurge.map(it => {
                            const itemId = it.id || it.cart_item_id || it.row_id || it.cart_id;
                            return fetch(`/api/proxy/cart/remove`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                body: JSON.stringify({ cart_item_id: itemId, product_id: it.product_id, user_id: String(userId) })
                            }).catch(() => null);
                        }));
                    }
                }
            } catch (e) { }

            // 2. Sync Bag items with backend-validated IDs
            const syncedItems = [];
            for (const item of cartItems) {
                const pId = Number(item.product_id || item.id);
                const slug = item.slug || item.product?.slug;
                let vId = Number(item.variant_id || item.variation_id || item._matchedVariation?.id || pId);
                const qty = Number(item.quantity) || 1;
                
                // Try to get real variant ID, if not found, use null (better than "1" for some backends)
                if (!vId || vId === 1 || vId === "1") {
                    try {
                        const pRes = await fetch(`/api/proxy/products/${slug}`);
                        if (pRes.ok) {
                            const pData = await pRes.json();
                            const variants = pData?.product?.variations || pData?.product?.variants || [];
                            vId = variants.length > 0 ? Number(variants[0].id) : null; 
                        }
                    } catch (e) { vId = null; }
                }

                syncedItems.push({ product_id: pId, variant_id: vId, quantity: qty });
                
                try {
                    await fetch("/api/proxy/cart/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ product_id: pId, variant_id: vId, variation_id: vId, quantity: qty, user_id: String(userId) })
                    }).catch(() => null);
                } catch (e) { }
            }

            // STEP 2: Checkout (The "Global compatibility" Payload)
            const finalItems = syncedItems.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                variation_id: item.variant_id,
                quantity: item.quantity
            }));

            const checkoutPayload = { 
                address_id: Number(finalAddressId),
                payment_method: "COD",
                user_id: Number(userId) || userId,
                items: finalItems,
                cart_items: finalItems
            };
            
            console.log("📦 Sending FINAL Injection Payload:", checkoutPayload);

            let checkoutResponse;
            try {
                checkoutResponse = await fetch("/api/proxy/order/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(checkoutPayload)
                });

                // If order/create fails with stock error, try /checkout as fallback
                if (!checkoutResponse.ok) {
                    console.log("⚠️ order/create failed, trying /api/checkout as fallback...");
                    checkoutResponse = await fetch("/api/proxy/checkout", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(checkoutPayload)
                    });
                }
            } catch (e) {
                console.log("⚠️ order/create error, trying /api/checkout as fallback...");
                checkoutResponse = await fetch("/api/proxy/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(checkoutPayload)
                });
            }

            const checkoutData = await checkoutResponse.json();
            console.log("Checkout API Response:", checkoutData);

            if (checkoutResponse.ok) {
                console.log("🎊 Order Success! Executing Nuclear Cart Purge...");
                
                // 1. CLEAR LOCAL STORAGE
                localStorage.removeItem("shri_divyam_cart_quantities");
                
                // 2. BLACKLIST PURCHASED ITEMS (Frontend Guard)
                try {
                    const removedStr = localStorage.getItem("shri_divyam_removed_items") || "[]";
                    const removedItems = JSON.parse(removedStr);
                    cartItems.forEach(it => {
                        const pId = it.product_id || it.id;
                        const vId = it.variant_id || it.variation_id || "";
                        const key = `${pId}-${vId}`;
                        if (!removedItems.includes(key)) removedItems.push(key);
                    });
                    localStorage.setItem("shri_divyam_removed_items", JSON.stringify(removedItems));
                } catch (e) { }

                // 3. FORCE PURGE SERVER CART (Using DELETE /api/cart/{id})
                const purgeTasks = cartItems.map(async (it) => {
                    const itemId = it.id || it.cart_item_id || it.row_id || it.cart_id;
                    try {
                        await fetch(`/api/proxy/cart/${itemId}`, {
                            method: "DELETE",
                            headers: { 
                                "Accept": "application/json", 
                                "Authorization": `Bearer ${token}` 
                            }
                        });
                    } catch (e) { }
                });

                Promise.all(purgeTasks.slice(0, 5));

                setStatus({ type: "success", message: "Order placed successfully!" });
                setTimeout(() => router.push("/order-success"), 1500);
            } else {
                throw new Error(checkoutData.message || checkoutData.error || "Checkout failed");
            }

        } catch (error) {
            console.error("Checkout process error:", error);
            setStatus({ type: "error", message: error.message || "An unexpected error occurred during checkout." });
        } finally {
            setIsLoading(false);
        }
    };

    const getRawPrice = (item) => {
        let price = item.price || item.product?.price || item.variant?.price || item.variation?.price || 0;
        
        // Sanitize string prices (e.g. "₹ 199" -> "199")
        if (typeof price === 'string') {
            price = price.replace(/[^\d.]/g, '');
        }
        
        const num = Number(price);
        return isNaN(num) ? 0 : num;
    };

    const totalItems = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (getRawPrice(item) * (Number(item.quantity) || 1)), 0);

    return (
        <main className="bg-white min-h-screen flex flex-col font-primary">
            <Header />

            <div className="flex-1 bg-[#F9F7F5] py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1240px] mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 mb-8">
                        <Link href="/my-bag" className="hover:text-[#7A1F3D] transition">My Bag</Link>
                        <span>/</span>
                        <span className="text-[#303030] font-bold">Checkout</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">

                        {/* LEFT: FORM */}
                        <div className="space-y-8">
                            <div className="bg-white border border-[#E8DDD4] p-6 sm:p-10 shadow-sm rounded-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 bg-[#7A1F3D] text-white flex items-center justify-center font-bold italic rounded-full shadow-lg">1</div>
                                    <h2 className="text-xl sm:text-2xl font-playfair font-bold text-[#303030]">Shipping Address</h2>
                                </div>

                                {!isAddingNewAddress ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Select a delivery address</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {savedAddresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                    className={`p-5 border rounded-sm cursor-pointer transition-all relative group ${selectedAddressId === addr.id ? "border-[#7A1F3D] bg-[#7A1F3D]/5 ring-1 ring-[#7A1F3D]" : "border-gray-200 hover:border-[#7A1F3D]/50 bg-white"}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-sm text-[#303030]">{addr.first_name} {addr.last_name}</h4>
                                                        {selectedAddressId === addr.id && <CheckCircle size={16} className="text-[#7A1F3D]" />}
                                                    </div>
                                                    <p className="text-[12px] text-gray-500 leading-relaxed">
                                                        {addr.address1}, {addr.address2 && `${addr.address2}, `}
                                                        {addr.landmark && `${addr.landmark}, `}
                                                        {addr.city}, {addr.state} - {addr.zipcode}
                                                    </p>
                                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                                                        <Phone size={12} /> {addr.phone}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add New Address Card */}
                                            <div
                                                onClick={() => setIsAddingNewAddress(true)}
                                                className="p-5 border border-dashed border-gray-300 rounded-sm cursor-pointer hover:border-[#7A1F3D] hover:bg-[#7A1F3D]/5 transition-all flex flex-col items-center justify-center gap-3 min-h-[120px] bg-gray-50/50"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#7A1F3D] transition-colors">
                                                    <Plus size={20} />
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#7A1F3D]">Add New Address</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                            <h3 className="text-lg font-playfair font-bold text-[#303030]">Add New Shipping Address</h3>
                                            <button
                                                onClick={() => setIsAddingNewAddress(false)}
                                                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#7A1F3D] hover:underline"
                                            >
                                                <ArrowLeft size={14} /> Back to saved
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">First Name</label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                        <input
                                                            type="text"
                                                            name="first_name"
                                                            value={formData.first_name}
                                                            onChange={handleInputChange}
                                                            onBlur={handleBlur}
                                                            onKeyDown={(e) => {
                                                                if (!/^[A-Za-z\s]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            placeholder="First Name"
                                                            className={`w-full pl-10 pr-4 py-3 border outline-none transition-all rounded-sm text-sm ${errors.first_name ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"}`}
                                                        />
                                                    </div>
                                                    {errors.first_name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.first_name}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Last Name</label>
                                                    <input
                                                        type="text"
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e) => {
                                                            if (!/^[A-Za-z\s]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        placeholder="Last Name"
                                                        className={`w-full px-4 py-3 border outline-none transition-all rounded-sm text-sm ${errors.last_name ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"}`}
                                                    />
                                                    {errors.last_name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.last_name}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Country</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                    <select
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 outline-none focus:border-[#7A1F3D] transition-all rounded-sm text-sm appearance-none bg-white"
                                                    >
                                                        <option value="India">India</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Address Line 1</label>
                                                    <div className="relative">
                                                        <Home className="absolute left-3 top-3 text-gray-300" size={16} />
                                                        <textarea
                                                            name="address1"
                                                            value={formData.address1}
                                                            onChange={handleInputChange}
                                                            onBlur={handleBlur}
                                                            placeholder="House No., Building, Street"
                                                            rows={2}
                                                            className={`w-full pl-10 pr-4 py-3 border outline-none transition-all rounded-sm text-sm resize-none ${errors.address1 ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"}`}
                                                        />
                                                    </div>
                                                    {errors.address1 && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.address1}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Address Line 2 (Optional)</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                        <input
                                                            type="text"
                                                            name="address2"
                                                            value={formData.address2}
                                                            onChange={handleInputChange}
                                                            placeholder="Apartment, Suite, Unit, etc."
                                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 outline-none focus:border-[#7A1F3D] transition-all rounded-sm text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Landmark / Suite (Optional)</label>
                                                    <div className="relative">
                                                        <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                        <input
                                                            type="text"
                                                            name="landmark"
                                                            value={formData.landmark}
                                                            onChange={handleInputChange}
                                                            placeholder="Near By"
                                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 outline-none focus:border-[#7A1F3D] transition-all rounded-sm text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">City</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e) => {
                                                            if (!/^[A-Za-z\s]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        placeholder="City"
                                                        className={`w-full px-4 py-3 border outline-none transition-all rounded-sm text-sm ${errors.city ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"}`}
                                                    />
                                                    {errors.city && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.city}</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">State</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        onKeyDown={(e) => {
                                                            if (!/^[A-Za-z\s]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        placeholder="State"
                                                        className={`w-full px-4 py-3 border outline-none transition-all rounded-sm text-sm ${errors.state ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"}`}
                                                    />
                                                    {errors.state && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.state}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Zipcode</label>
                                                    <input
                                                        type="text"
                                                        name="zipcode"
                                                        value={formData.zipcode}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        maxLength={6}
                                                        onKeyDown={(e) => {
                                                            if (!/^[0-9]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        placeholder="Zipcode (6 digits)"
                                                        className={`w-full px-4 py-3 border outline-none transition-all rounded-sm text-sm ${errors.zipcode ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"}`}
                                                    />
                                                    {errors.zipcode && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.zipcode}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Contact Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        maxLength={10}
                                                        onKeyDown={(e) => {
                                                            if (!/^[0-9]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        placeholder="10-digit Phone Number (e.g. 9876543210)"
                                                        className={`w-full pl-10 pr-4 py-3 border outline-none transition-all rounded-sm text-sm ${errors.phone ? "border-red-300 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-[#7A1F3D]"}`}
                                                    />
                                                </div>
                                                {errors.phone && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.phone}</p>}
                                            </div>

                                            <div className="flex items-center gap-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    id="save_address"
                                                    name="save_address"
                                                    checked={formData.save_address}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, save_address: e.target.checked }))}
                                                    className="w-4 h-4 accent-[#7A1F3D] cursor-pointer"
                                                />
                                                <label htmlFor="save_address" className="text-sm font-medium text-gray-600 cursor-pointer">
                                                    Save this address to my profile
                                                </label>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!validate()) return;
                                                    setIsLoading(true);
                                                    const token = localStorage.getItem("token");
                                                    try {
                                                        const res = await fetch("/api/proxy/address/store", {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                "Accept": "application/json",
                                                                "Authorization": `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify(formData)
                                                        });
                                                        if (res.ok) {
                                                            const data = await res.json();
                                                            const newId = data.address_id || data.data?.id || data.id;

                                                            // Prepare the new address object for instant UI injection
                                                            const newAddressObj = {
                                                                ...formData,
                                                                id: newId,
                                                                address_id: newId
                                                            };

                                                            // Update state immediately without waiting for re-fetch
                                                            setSavedAddresses(prev => {
                                                                const exists = prev.some(a => String(a.id) === String(newId));
                                                                if (exists) return prev;
                                                                return [newAddressObj, ...prev];
                                                            });

                                                            setSelectedAddressId(newId);
                                                            setIsAddingNewAddress(false);
                                                            setStatus({ type: "success", message: "Address saved successfully!" });

                                                            // Also trigger a background refresh just in case
                                                            fetch("/api/proxy/address", {
                                                                headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
                                                            }).then(r => r.json()).then(listData => {
                                                                const list = listData.addresses || listData.data || (Array.isArray(listData) ? listData : []);
                                                                if (list.length > 0) setSavedAddresses(list);
                                                            }).catch(() => null);
                                                        } else {
                                                            const errData = await res.json();
                                                            setStatus({ type: "error", message: errData.message || "Failed to save" });
                                                        }
                                                    } catch (e) {
                                                        setStatus({ type: "error", message: "Error saving address" });
                                                    } finally {
                                                        setIsLoading(false);
                                                    }
                                                }}
                                                className="w-full py-4 bg-[#7A1F3D] text-white font-bold uppercase tracking-widest text-[11px] rounded-sm hover:bg-[#5E182F] transition-all shadow-lg flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Save Address</>}
                                            </button>

                                            <button type="submit" className="hidden" id="submit-shipping-form"></button>
                                        </form>
                                    </div>
                                )}
                            </div>

                            <div id="payment-section" className="bg-white border border-[#E8DDD4] p-6 sm:p-10 shadow-sm rounded-sm ring-2 ring-[#7A1F3D]/10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 flex items-center justify-center font-bold italic rounded-full shadow-lg bg-[#7A1F3D] text-white">2</div>
                                    <h2 className="text-xl sm:text-2xl font-playfair font-bold text-[#303030]">Payment Method</h2>
                                </div>

                                <div className="space-y-4">
                                    <div
                                        onClick={() => setPaymentMethod("cod")}
                                        className="group relative p-6 border-2 rounded-sm cursor-pointer transition-all flex items-center justify-between border-[#7A1F3D] bg-[#7A1F3D]/5"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center border-[#7A1F3D]">
                                                <div className="w-3 h-3 bg-[#7A1F3D] rounded-full"></div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#303030] uppercase tracking-widest text-xs mb-1">Cash on Delivery</p>
                                                <p className="text-[11px] text-gray-500 font-medium">Pay with cash when your divine order arrives</p>
                                            </div>
                                        </div>
                                        <Truck className="shrink-0 text-[#7A1F3D]" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: SUMMARY */}
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="bg-[#FDF8F3] border border-[#E8DDD4] rounded-sm p-6 sm:p-8 shadow-xl">
                                <h3 className="text-xl font-playfair font-bold text-[#303030] mb-6 pb-2 border-b border-[#E8DDD4] flex justify-between items-center">
                                    <span>Order Review</span>

                                </h3>

                                {/* Empty space removed per user request */}

                                <div className="space-y-4 pt-4 border-t border-[#E8DDD4]">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Items Count</span>
                                        <span className="font-semibold text-[#303030]">{totalItems} Item{totalItems !== 1 ? "s" : ""}</span>
                                    </div>

                                    <div className="pt-4 border-t-[2px] border-[#E8DDD4] flex justify-between items-end">
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">Total Amount</span>
                                            <span className="font-playfair font-bold text-[#303030] text-lg uppercase">Grand Total</span>
                                        </div>
                                        <span className="font-bold text-[#7A1F3D] text-2xl sm:text-3xl tracking-tight">{formatPrice(totalPrice, 0)}</span>
                                    </div>
                                </div>

                                {status.message && (
                                    <div className={`mb-6 p-4 rounded-sm flex items-start gap-3 animate-in fade-in duration-300 ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                        <CheckCircle size={18} className="shrink-0 mt-0.5" />
                                        <p className="text-[13px] font-medium leading-tight">{status.message}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || isFetchingCart || isSyncing || cartItems.length === 0}
                                    className={`w-full py-5 bg-[#7A1F3D] text-white font-bold uppercase tracking-[0.25em] text-[13px] hover:bg-[#5E182F] transition-all flex items-center justify-center gap-3 rounded-sm shadow-xl active:scale-[0.98] ${(isLoading || isSyncing) ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Processing...
                                        </>
                                    ) : isSyncing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Syncing Cart...
                                        </>
                                    ) : (
                                        "Complete Order"
                                    )}
                                </button>
                            </div>

                            <div className="space-y-4 px-4">
                                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    <ShieldCheck size={18} className="text-[#7A1F3D]" />
                                    100% Secure Transaction
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    <Truck size={18} className="text-[#7A1F3D]" />
                                    Global Delivery Assured
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
