"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { Loader2, ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Truck, AlertCircle } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";

const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

// --- localStorage helpers for persistent cart removal ---
const REMOVED_ITEMS_KEY = "shri_divyam_removed_cart_items";

const getRemovedItems = () => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(REMOVED_ITEMS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

// Resolve the display ID of a cart item (same chain as rendering uses)
const resolveItemId = (item) => {
    return item.id || item.cart_item_id || item.row_id || item.cart_id || item.variation_id || item.product_id;
};

const addRemovedItem = (cartItem) => {
    try {
        const removed = getRemovedItems();
        const pId = String(cartItem.product_id || cartItem.id || "");
        const vId = cartItem.variant_id || cartItem.variation_id || "";

        if (!pId) return;

        // Check if this specific product/variant combo is already in removed list
        const exists = removed.some(r => r.pId === pId && String(r.vId) === String(vId));
        if (!exists) {
            removed.push({ pId, vId: String(vId), time: Date.now() });
            localStorage.setItem(REMOVED_ITEMS_KEY, JSON.stringify(removed));
        }
    } catch (e) { console.error("Failed to save removed item:", e); }
};

const clearRemovedItem = (productId) => {
    try {
        const pId = String(productId);
        const removed = getRemovedItems();
        // Clear ALL entries matching this product_id (so re-added products show up)
        const filtered = removed.filter(r => String(r.pId) !== pId);
        localStorage.setItem(REMOVED_ITEMS_KEY, JSON.stringify(filtered));
    } catch (e) {}
};

const isItemRemoved = (item) => {
    const removed = getRemovedItems();
    if (!removed || removed.length === 0) return false;

    const pId = String(item.product_id || item.id || "");
    const vId = String(item.variant_id || item.variation_id || "");

    if (!pId) return false;

    return removed.some(r => {
        // Must match product ID
        if (r.pId !== pId) return false;
        // If variant exists in both, must match too. If only one has it, we still match by product.
        if (r.vId && vId) return r.vId === vId;
        return true;
    });
};

const filterRemovedItems = (items) => {
    return items.filter(item => !isItemRemoved(item));
};

// --- localStorage helpers for persistent cart quantities ---
const CART_QUANTITIES_KEY = "shri_divyam_cart_quantities";

const getSavedQuantities = () => {
    try {
        const stored = localStorage.getItem(CART_QUANTITIES_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) { return {}; }
};

const saveQuantity = (itemKey, qty) => {
    try {
        const quantities = getSavedQuantities();
        quantities[itemKey] = qty;
        localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));
    } catch (e) {}
};

const removeQuantity = (itemKey) => {
    try {
        const quantities = getSavedQuantities();
        delete quantities[itemKey];
        localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));
    } catch (e) {}
};

// Generate a stable key for a cart item
const getItemKey = (item) => {
    const productId = item.product_id || item.id;
    const variantId = item.variant_id || item.variation_id || '';
    return `${productId}_${variantId}`;
};

export default function MyBagPage() {
    const router = useRouter();
    const { formatPrice } = useCurrency();

    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const fetchCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setIsLoading(false);
            setError("login_required");
            return;
        }

        try {
            const response = await fetch("https://shreedivyam.kdscrm.com/api/cart", {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const text = await response.text();
            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error("Cart fetch parse error:", text);
                    setError("Failed to load cart data.");
                    setIsLoading(false);
                    return;
                }
            }

            if (response.ok) {
                // Handle different API response structures
                const rawItems = data.cart_items || data.cart || data.items || data.data || [];
                let parsedItems = [];

                if (Array.isArray(rawItems)) {
                    parsedItems = rawItems;
                } else if (rawItems && typeof rawItems === 'object' && Array.isArray(rawItems.items)) {
                    parsedItems = rawItems.items;
                }

                // ★ Filter out locally removed items so they don't reappear on refresh
                const filteredItems = filterRemovedItems(parsedItems);

                // ★ Override API quantities with user-set quantities from localStorage (default to 1)
                const savedQty = getSavedQuantities();
                const itemsWithCorrectQty = filteredItems.map(item => {
                    const key = getItemKey(item);
                    if (savedQty[key] !== undefined) {
                        return { ...item, quantity: savedQty[key] };
                    }
                    // Default: quantity = 1 (ignore API's unreliable quantity)
                    return { ...item, quantity: 1 };
                });

                setCartItems(itemsWithCorrectQty);

                setError("");

                // --- PRODUCT ENRICHMENT START ---
                const itemsToEnrich = filteredItems.filter(it => !it.product_name && !it.name && !it.image_path && !it.image);
                if (itemsToEnrich.length > 0) {
                    enrichItems(filteredItems);
                } else {
                    // Even if no enrichment needed, still fetch variant stocks for stock validation
                    fetchVariantStocks();
                }
                // --- PRODUCT ENRICHMENT END ---
            } else {
                setError(data.message || "Failed to fetch cart.");
            }
        } catch (err) {
            console.error("Cart fetch error:", err);
            setError("Network error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // enrichment helper to fill in missing product data from all major categories
    const enrichItems = async (items) => {
        try {
            // Fetch from multiple sources in parallel to maximize lookup hits
            const endpoints = [
                "https://shreedivyam.kdscrm.com/api/premium/products",
                "https://shreedivyam.kdscrm.com/api/products/category/laddu-gopal",
                "https://shreedivyam.kdscrm.com/api/products/category/radhe-rani",
                "https://shreedivyam.kdscrm.com/api/products/category/mata-rani"
            ];

            const results = await Promise.all(endpoints.map(url =>
                fetch(url).then(res => res.json()).catch(() => ({}))
            ));

            // Flatten all results into one big product pool
            let allProducts = [];
            results.forEach(json => {
                const pool = json.data || json.products || json || [];
                if (Array.isArray(pool)) allProducts = [...allProducts, ...pool];
            });

            if (allProducts.length > 0) {
                setCartItems(prev => prev.map(item => {
                    // Search by product_id or id
                    const pId = item.product_id || item.id;
                    const found = allProducts.find(p => p.id == pId);

                    if (found) {
                        return {
                            ...item,
                            // Use existing values if they exist, otherwise use found ones
                            product_name: item.product_name || item.name || found.name || found.title,
                            image_path: item.image_path || item.image || found.image_path || found.image,
                            slug: item.slug || found.slug,
                            price: item.price || found.price,
                            product: item.product || found,
                            stock: item.stock !== undefined ? item.stock : (found.stock !== undefined ? found.stock : null)
                        };
                    }
                    return item;
                }));
            }

            // ★ PHASE 2: Fetch individual product details for accurate per-variant stock
            await fetchVariantStocks();
        } catch (e) {
            console.error("Enrichment error:", e);
        }
    };

    // Fetch detailed product data (with variant-level stock) for every cart item
    const fetchVariantStocks = async () => {
        try {
            setCartItems(prev => {
                // Collect slugs/product_ids to fetch
                const itemsToFetch = prev.filter(item => {
                    const slug = item.slug || item.product?.slug;
                    return slug && !item._stockFetched;
                });

                if (itemsToFetch.length === 0) return prev;

                // Fire off fetches in background
                const slugs = [...new Set(itemsToFetch.map(it => it.slug || it.product?.slug).filter(Boolean))];

                Promise.all(
                    slugs.map(slug =>
                        fetch(`https://shreedivyam.kdscrm.com/api/products/${slug}`)
                            .then(res => res.ok ? res.json() : null)
                            .catch(() => null)
                    )
                ).then(results => {
                    const productMap = {};
                    results.forEach(data => {
                        if (data?.product) {
                            const p = data.product;
                            if (p.variants && !p.variations) p.variations = p.variants;
                            productMap[p.slug] = p;
                            if (p.id) productMap[`id_${p.id}`] = p;
                        }
                    });

                    if (Object.keys(productMap).length > 0) {
                        setCartItems(current => current.map(item => {
                            const slug = item.slug || item.product?.slug;
                            const detailedProduct = productMap[slug] || productMap[`id_${item.product_id}`];

                            if (detailedProduct) {
                                // Find matching variation for this cart item
                                const vId = item.variant_id || item.variation_id;
                                let matchedVariation = null;
                                if (vId && detailedProduct.variations) {
                                    matchedVariation = detailedProduct.variations.find(v => String(v.id) === String(vId));
                                }
                                // If no variant match, use first variation as fallback
                                if (!matchedVariation && detailedProduct.variations?.length > 0) {
                                    matchedVariation = detailedProduct.variations[0];
                                }

                                return {
                                    ...item,
                                    product: detailedProduct,
                                    _matchedVariation: matchedVariation,
                                    _stockFetched: true,
                                    // Set stock from the matched variation
                                    _variantStock: matchedVariation?.stock !== undefined ? Number(matchedVariation.stock) : null,
                                    _productStock: detailedProduct.stock !== undefined ? Number(detailedProduct.stock) : null
                                };
                            }
                            return { ...item, _stockFetched: true };
                        }));
                    }
                });

                return prev;
            });
        } catch (e) {
            console.error("Variant stock fetch error:", e);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemoveItem = async (cartItemId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Find the target item BEFORE removing
        const targetItem = cartItems.find((ci, idx) => {
            const id = ci.id || ci.cart_item_id || ci.row_id || ci.cart_id || ci.variation_id || ci.product_id;
            return id == cartItemId || `index-${idx}` == cartItemId;
        });

        // ★ STEP 1: Save to localStorage FIRST (this is what persists across refresh)
        if (targetItem) {
            addRemovedItem(targetItem);
            // Also clean up the quantity entry
            removeQuantity(getItemKey(targetItem));
        }

        // ★ STEP 2: Instant UI removal (will never revert)
        setCartItems(prev => prev.filter((it, idx) => {
            const id = it.id || it.cart_item_id || it.row_id || it.cart_id || it.variation_id || it.product_id;
            return (id != cartItemId && `index-${idx}` != cartItemId);
        }));

        // ★ STEP 3: Try API removal in background (best effort, won't affect UI)
        let userId = "";
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const userData = JSON.parse(userStr);
                userId = userData?.id || userData?.user_id || userData?.userid || userData?.ID || "";
            }
        } catch (e) { }

        // Fire-and-forget API calls (try all strategies in background)
        const tryRemoveFromServer = async () => {
            const strategies = [
                () => fetch(`https://shreedivyam.kdscrm.com/api/cart/remove`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({
                        cart_item_id: cartItemId,
                        id: cartItemId,
                        product_id: targetItem?.product_id,
                        variation_id: targetItem?.variation_id || targetItem?.variant_id,
                        user_id: String(userId)
                    })
                }),
                () => fetch(`https://shreedivyam.kdscrm.com/api/cart/remove/${cartItemId}`, {
                    method: "DELETE",
                    headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
                }),
                () => fetch(`https://shreedivyam.kdscrm.com/api/cart/delete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ cart_item_id: cartItemId, id: cartItemId, product_id: targetItem?.product_id, user_id: String(userId) })
                }),
                () => fetch(`https://shreedivyam.kdscrm.com/api/cart/remove/${cartItemId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ user_id: String(userId) })
                })
            ];

            for (const strategy of strategies) {
                try {
                    const res = await strategy();
                    if (res.ok) {
                        console.log("✅ Server-side cart removal succeeded");
                        // If server removal worked, we can clean up localStorage entry
                        if (targetItem) {
                            clearRemovedItem(targetItem.product_id);
                        }
                        return;
                    }
                } catch (e) { /* continue */ }
            }
            console.log("ℹ️ Server removal not supported - item hidden locally via localStorage");
        };

        // Run in background - don't await, don't block UI
        tryRemoveFromServer().catch(() => {});
    };

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        // ★ Find the item first so we can validate stock BEFORE updating
        const foundItem = cartItems.find((ci, idx) => {
            const id = ci.id || ci.cart_item_id || ci.row_id || ci.cart_id || ci.variation_id || ci.product_id;
            return id == cartItemId || `index-${idx}` == cartItemId;
        });

        const targetQuantity = Number(newQuantity);

        // ★ STOCK VALIDATION: Block quantity if it exceeds available stock
        if (foundItem) {
            const maxStock = getMaxStock(foundItem);
            if (maxStock !== Infinity && targetQuantity > maxStock) {
                // Don't allow exceeding stock
                return;
            }
        }

        // ★ Save user-chosen quantity to localStorage (persists across refresh)
        if (foundItem) {
            saveQuantity(getItemKey(foundItem), targetQuantity);
        }

        let userId = "";
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const userData = JSON.parse(userStr);
                userId = userData?.id || userData?.user_id || userData?.userid || userData?.ID || "";
            }
        } catch (e) { }

        setUpdatingId(cartItemId);

        // Optimistic UI Update
        const originalItems = [...cartItems];
        setCartItems(prev => prev.map((it, index) => {
            const currentItemId = it.id || it.cart_item_id || it.row_id || it.cart_id || it.variation_id || it.product_id || `index-${index}`;
            if (currentItemId == cartItemId) return { ...it, quantity: targetQuantity };
            return it;
        }));

        // Backend requires valid variant_id but doesn't supply it. Fetch it dynamically.
        let realVariantId = foundItem?.variant_id || foundItem?.variation_id || foundItem?.variation?.id || "";

        if (!realVariantId && (foundItem?.product_id || foundItem?.slug)) {
            try {
                if (foundItem?.slug) {
                    const prodRes = await fetch(`https://shreedivyam.kdscrm.com/api/products/${foundItem.slug}`);
                    if (prodRes.ok) {
                        const probObj = await prodRes.json();
                        const vrs = probObj?.product?.variations || probObj?.product?.variants;
                        if (vrs && vrs.length > 0) realVariantId = vrs[0].id;
                    }
                }

                if (!realVariantId && foundItem?.product_id) {
                    const premRes = await fetch(`https://shreedivyam.kdscrm.com/api/premium/products`);
                    if (premRes.ok) {
                        const premJson = await premRes.json();
                        const pool = premJson.data || premJson.products || premJson || [];
                        const pFound = pool.find(x => x.id == foundItem.product_id);
                        const vrs = pFound?.variations || pFound?.variants;
                        if (vrs && vrs.length > 0) realVariantId = vrs[0].id;
                    }
                }
            } catch (e) { }
        }

        if (!realVariantId) realVariantId = "1";

        const strategies = [
            // Strategy 1: POST /api/cart/add (THE ONLY CONFIRMED WORKING ENDPOINT)
            // Some APIs use 'add' with existing IDs to update quantity
            async () => fetch(`https://shreedivyam.kdscrm.com/api/cart/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    user_id: String(userId),
                    product_id: String(foundItem?.product_id || ""),
                    variant_id: String(realVariantId),
                    quantity: String(targetQuantity),
                    cart_item_id: cartItemId,
                    id: cartItemId
                })
            }),
            // Strategy 2: POST /api/cart/update (Body payload - HYPER ROBUST)
            async () => fetch(`https://shreedivyam.kdscrm.com/api/cart/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    cart_item_id: cartItemId,
                    id: cartItemId,
                    row_id: cartItemId,
                    item_id: cartItemId,
                    cart_id: cartItemId,
                    product_id: foundItem?.product_id,
                    variant_id: String(realVariantId),
                    quantity: targetQuantity,
                    user_id: String(userId)
                })
            }),
            // Strategy 3: POST /api/cart/update/{id} (Parameterized)
            async () => fetch(`https://shreedivyam.kdscrm.com/api/cart/update/${cartItemId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    quantity: targetQuantity,
                    user_id: String(userId),
                    id: cartItemId,
                    cart_item_id: cartItemId,
                    row_id: cartItemId
                })
            }),
            // Strategy 4: POST /api/cart/update with Laravel Method Spoofing
            async () => fetch(`https://shreedivyam.kdscrm.com/api/cart/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    _method: "PUT",
                    id: cartItemId,
                    cart_item_id: cartItemId,
                    quantity: targetQuantity,
                    user_id: String(userId)
                })
            }),
            // Strategy 5: GET /api/cart/update/{id}?quantity={q}
            async () => fetch(`https://shreedivyam.kdscrm.com/api/cart/update/${cartItemId}?quantity=${targetQuantity}`, {
                method: "GET",
                headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
            }),
            // Strategy 6: POST /api/cart/update-quantity
            async () => fetch(`https://shreedivyam.kdscrm.com/api/cart/update-quantity`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ cart_item_id: cartItemId, quantity: targetQuantity })
            }),
            // Strategy 7: FormData POST /api/cart/update (Classic PHP/Laravel)
            async () => {
                const formData = new FormData();
                formData.append('cart_item_id', cartItemId);
                formData.append('id', cartItemId);
                formData.append('quantity', targetQuantity);
                formData.append('user_id', String(userId));
                formData.append('_method', 'POST');
                return fetch(`https://shreedivyam.kdscrm.com/api/cart/update`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
                    body: formData
                });
            }
        ];

        try {
            let success = false;
            let lastError = "";
            let strategyIndex = 0;

            for (let i = 0; i < strategies.length; i++) {
                strategyIndex = i + 1;
                try {
                    const response = await strategies[i]();
                    const contentType = response.headers.get("content-type");

                    if (response.ok && contentType && contentType.includes("application/json")) {
                        success = true;
                        break;
                    } else if (response.ok) {
                        lastError = `S${strategyIndex}:HTML Response`;
                    } else {
                        lastError = `S${strategyIndex}:${response.status}`;
                    }
                } catch (e) { lastError = `S${strategyIndex}:Err`; }
            }

            if (!success) {
                // Let it fail silently per original requirement to avoid showing raw errors
                setCartItems(originalItems);
            }
        } catch (err) {
            console.error("Network error.");
            setCartItems(originalItems);
        } finally {
            setUpdatingId(null);
        }
    };

    // Get product image URL - Universal Resolver version
    const getImageUrl = (item) => {
        if (!item) return null;

        // Strategy 1: Known keys at various depths
        const knownKeys = ['image_path', 'image', 'product_image', 'thumbnail', 'product_details_image', 'img', 'pic'];

        const findImg = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            for (const key of knownKeys) {
                if (obj[key] && typeof obj[key] === 'string') return obj[key];
            }
            // Check deeper nested paths common in CRM APIs
            return obj.product?.image_path ||
                obj.product?.image ||
                obj.product_details?.image_path ||
                obj.variation?.product?.image_path ||
                obj.variation?.image_path ||
                obj.variant?.product?.image_path ||
                obj.variant?.image_path ||
                obj.variation?.image ||
                obj.detail?.image_path ||
                null;
        };

        let img = findImg(item);

        // Strategy 2: Scan for any key containing 'image' or 'path' or 'thumb'
        if (!img) {
            const allKeys = Object.keys(item);
            const foundKey = allKeys.find(k => (k.includes('image') || k.includes('path') || k.includes('thumb')) && item[k] && typeof item[k] === 'string');
            if (foundKey) img = item[foundKey];
        }

        if (!img) return null;

        // Handle full URLs
        if (typeof img === 'string' && img.startsWith("http")) return img;

        // Handle relative paths
        const cleanImg = typeof img === 'string' ? img : (img?.image || img?.image_path || '');
        if (!cleanImg) return null;

        return IMAGE_BASE_URL + cleanImg;
    };

    // Get product name - Universal Resolver version
    const getProductName = (item) => {
        if (!item) return "Premium Product";

        // Strategy 1: Known keys
        const knownKeys = ['product_name', 'name', 'title', 'item_name', 'product_title'];
        const findName = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            for (const key of knownKeys) {
                if (obj[key] && typeof obj[key] === 'string') return obj[key];
            }
            return obj.product?.name ||
                obj.product_details?.name ||
                obj.variation?.product?.name ||
                obj.variant?.product?.name ||
                obj.variation?.name ||
                obj.variant?.name ||
                obj.product_details?.product_name ||
                obj.detail?.product_name ||
                null;
        };

        let name = findName(item);

        // Strategy 2: Search for 'name' or 'title' in any key
        if (!name) {
            const allKeys = Object.keys(item);
            const foundKey = allKeys.find(k => (k.includes('name') || k.includes('title')) && item[k] && typeof item[k] === 'string');
            if (foundKey) name = item[foundKey];
        }

        // Strategy 3: Slug Fallback
        if (!name) {
            const slug = item.slug || item.product_slug || item.product?.slug;
            if (slug && typeof slug === 'string') {
                return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            }
        }

        return name || "Premium Product";
    };

    // Get item price
    const getItemPrice = (item) => {
        const price = item.price || item.product?.price || item.variant?.price || item.variation?.price || 0;
        const usdPrice = item.usd_price || item.product?.usd_price || item.variant?.usd_price || 0;
        return formatPrice(price, usdPrice);
    };

    // Get raw price for total calculation
    const getRawPrice = (item) => {
        return Number(item.price || item.product?.price || item.variant?.price || item.variation?.price || 0);
    };

    // Get max stock for an item
    const getMaxStock = (item) => {
        if (!item) return Infinity;

        let stockVal = null;

        // ★ Priority 0: Check enriched variant stock (most accurate)
        if (item._variantStock !== undefined && item._variantStock !== null) {
            return Number(item._variantStock);
        }

        const vId = item.variant_id || item.variation_id || item.variation?.id || item.variant?.id;
        const product = item.product || item.product_details;

        // 1. Check direct variants/variations from enriched product data
        if (vId && product) {
            const vars = product.variations || product.variants;
            if (Array.isArray(vars)) {
                const targetVar = vars.find(v => String(v.id) === String(vId));
                if (targetVar && targetVar.stock !== undefined && targetVar.stock !== null) stockVal = targetVar.stock;
            }
        }

        // 2. Check matched variation from enrichment
        if (stockVal === null && item._matchedVariation) {
            if (item._matchedVariation.stock !== undefined && item._matchedVariation.stock !== null) {
                stockVal = item._matchedVariation.stock;
            }
        }

        // 3. Check variation object stock
        if (stockVal === null) {
            const variation = item.variation || item.variant || item.variant_details;
            if (variation && variation.stock !== undefined && variation.stock !== null) stockVal = variation.stock;
        }

        // 4. Check direct item stock
        if (stockVal === null && item.stock !== undefined && item.stock !== null) stockVal = item.stock;

        // 5. Check enriched product-level stock
        if (stockVal === null && item._productStock !== undefined && item._productStock !== null) stockVal = item._productStock;

        // 6. Check product level stock
        if (stockVal === null && product && product.stock !== undefined && product.stock !== null) stockVal = product.stock;

        return stockVal !== null ? Number(stockVal) : Infinity;
    };

    // Calculate totals
    const totalItems = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (getRawPrice(item) * (Number(item.quantity) || 1)), 0);

    // Get variant info
    const getVariantInfo = (item) => {
        if (!item) return "";
        const color = item.color || item.variant?.color || item.variation?.color || item.product_details?.color || item.variant_details?.color || "";
        const size = item.size || item.variant?.size || item.variation?.size || item.product_details?.size || item.variant_details?.size || "";
        if (color && size) return `${size} / ${color}`;
        if (color) return color;
        if (size) return size;
        return "";
    };

    return (
        <main className="bg-white min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 bg-[#F9F7F5]">
                <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24 py-4 md:py-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-6">
                        <Link href="/" className="hover:text-[#7A1F3D] transition">Home</Link>
                        <span>/</span>
                        <span className="text-[#303030] font-medium">My Bag</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-[#303030] mb-2">
                        My Shopping Bag
                    </h1>
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-sm text-gray-400">{totalItems} item{totalItems !== 1 ? "s" : ""} in your bag</p>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={48} className="text-[#7A1F3D] animate-spin mb-4" />
                            <p className="text-gray-500">Loading your bag...</p>
                        </div>
                    )}

                    {/* Login Required */}
                    {!isLoading && error === "login_required" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <ShoppingBag size={64} className="text-gray-300 mb-6" />
                            <h2 className="text-2xl font-playfair font-semibold text-[#303030] mb-2">Please Login First</h2>
                            <p className="text-gray-500 mb-8 max-w-md">You need to be logged in to view your shopping bag.</p>
                            <Link href="/login">
                                <button className="bg-[#7A1F3D] text-white px-8 py-3 font-medium hover:bg-[#5E182F] transition uppercase tracking-widest text-sm">
                                    Login Now
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* Error State */}
                    {!isLoading && error && error !== "login_required" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <AlertCircle size={48} className="text-red-400 mb-4" />
                            <p className="text-red-600 font-medium mb-4">{error}</p>
                            <button onClick={() => { setIsLoading(true); setError(""); fetchCart(); }} className="bg-[#7A1F3D] text-white px-6 py-2 text-sm font-medium hover:bg-[#5E182F] transition">
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty Cart */}
                    {!isLoading && !error && cartItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <ShoppingBag size={64} className="text-gray-300 mb-6" />
                            <h2 className="text-2xl font-playfair font-semibold text-[#303030] mb-2">Your bag is empty</h2>
                            <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your bag yet. Browse our collection to find something you'll love.</p>
                            <Link href="/">
                                <button className="bg-[#7A1F3D] text-white px-8 py-3 font-medium hover:bg-[#5E182F] transition uppercase tracking-widest text-sm">
                                    Browse Collection
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* Cart Items */}
                    {!isLoading && !error && cartItems.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:items-start">
                            {/* Left: Cart Items List */}
                            <div className="space-y-4">
                                {cartItems.map((item, index) => {
                                    // Robust ID identification
                                    const realId = item.id || item.cart_item_id || item.row_id || item.cart_id || item.variation_id || item.product_id;
                                    const itemId = realId || `index-${index}`;

                                    const imageUrl = getImageUrl(item);
                                    const productName = getProductName(item);
                                    const variantInfo = getVariantInfo(item);
                                    const quantity = Number(item.quantity) || 1;
                                    const isUpdating = updatingId === itemId;

                                    const maxStock = getMaxStock(item);
                                    const isAtMaxStock = quantity >= maxStock;

                                    return (
                                        <div
                                            key={itemId}
                                            className={`bg-white border border-[#E8DDD4] rounded-sm p-4 sm:p-5 shadow-sm flex gap-4 sm:gap-6 items-start transition-opacity`}
                                        >
                                            {/* Product Image */}
                                            <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] bg-[#F9F7F5] border border-[#E8DDD4] rounded-sm overflow-hidden shrink-0">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={productName} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm sm:text-base font-semibold text-[#303030] truncate">{productName}</h3>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${itemId.toString().startsWith('index-') ? "bg-red-50 text-red-400 border border-red-100" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                                                        ID: {itemId}
                                                    </span>
                                                </div>
                                                {variantInfo && (
                                                    <p className="text-[11px] text-gray-400 mb-2 uppercase tracking-wider font-medium">{variantInfo}</p>
                                                )}
                                                <p className="text-lg font-bold text-[#7A1F3D] mb-3">{getItemPrice(item)}</p>

                                                {/* Stock Info Badge */}
                                                {maxStock !== Infinity && (
                                                    <div className="mb-2">
                                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border ${
                                                            maxStock <= 0 
                                                                ? "bg-red-50 text-red-600 border-red-100" 
                                                                : maxStock <= 5 
                                                                    ? "bg-amber-50 text-amber-600 border-amber-100" 
                                                                    : "bg-green-50 text-green-600 border-green-100"
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${maxStock <= 0 ? "bg-red-500" : maxStock <= 5 ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}></span>
                                                            {maxStock <= 0 ? "Out of Stock" : `${maxStock} in stock`}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Quantity Controls */}
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center border border-[#E8DDD4] rounded-sm bg-white h-8">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleUpdateQuantity(itemId, quantity - 1);
                                                                }}
                                                                disabled={quantity <= 1 || isUpdating}
                                                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition border-r border-[#E8DDD4] disabled:opacity-30"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="w-10 text-center text-[#303030] font-semibold text-sm">{quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (!isAtMaxStock) {
                                                                        handleUpdateQuantity(itemId, quantity + 1);
                                                                    }
                                                                }}
                                                                disabled={isUpdating || isAtMaxStock}
                                                                className={`w-8 h-full flex items-center justify-center transition border-l border-[#E8DDD4] ${isUpdating || isAtMaxStock ? "text-gray-300 bg-gray-50 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50 active:bg-gray-100"}`}
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => handleRemoveItem(itemId)}
                                                            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition font-medium"
                                                        >
                                                            <Trash2 size={14} />
                                                            Remove
                                                        </button>
                                                    </div>

                                                    {isAtMaxStock && maxStock !== Infinity && (
                                                        <span className="text-[10px] text-red-500 font-medium">Max stock reached ({maxStock})</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Item Total */}
                                            <div className="hidden sm:block text-right shrink-0">
                                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Total</p>
                                                <p className="font-bold text-[#303030]">{formatPrice(getRawPrice(item) * quantity, 0)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right: Order Summary */}
                            <div className="bg-[#FDF8F3] border border-[#E8DDD4] rounded-sm p-5 sm:p-7 shadow-lg lg:sticky lg:top-24">
                                <h3 className="text-lg font-playfair font-bold text-[#303030] mb-4 pb-2 border-b border-[#E8DDD4]">Order Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                                        <span className="font-semibold text-[#303030]">{formatPrice(totalPrice, 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Standard Shipping</span>
                                        <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest bg-green-50 px-2 py-0.5 rounded border border-green-100">FREE</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Estimated Taxes</span>
                                        <span className="text-[#303030] italic text-xs">Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t-[2px] border-[#E8DDD4] flex justify-between items-end mb-6">
                                    <div>
                                        <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">Total Amount</span>
                                        <span className="font-bold text-[#303030] text-lg uppercase">Grand Total</span>
                                    </div>
                                    <span className="font-bold text-[#7A1F3D] text-3xl tracking-tight">{formatPrice(totalPrice, 0)}</span>
                                </div>

                                <button className="w-full py-4 bg-[#7A1F3D] text-white font-bold uppercase tracking-[0.25em] text-[13px] hover:bg-[#5E182F] transition-all flex items-center justify-center gap-3 rounded-sm shadow-[0_10px_20px_-10px_rgba(122,31,61,0.3)] active:scale-[0.98]">
                                    Proceed To Checkout
                                </button>

                                <button
                                    onClick={() => router.push("/")}
                                    className="w-full flex items-center justify-center gap-2 text-[12px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#7A1F3D] transition py-3 mt-3"
                                >
                                    <ArrowLeft size={16} />
                                    Continue Shopping
                                </button>

                                {/* Trust Badges */}
                                <div className="mt-6 pt-4 border-t border-[#E8DDD4] space-y-3">
                                    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                        <ShieldCheck size={18} className="text-[#7A1F3D]" />
                                        100% Secure Checkout
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                        <Truck size={18} className="text-[#7A1F3D]" />
                                        Fast & Safe Shipping
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
