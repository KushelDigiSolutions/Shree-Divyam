"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { Loader2, ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Truck, AlertCircle } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { updateCartItemQuantity, removeCartItem, CART_QUANTITIES_KEY, REMOVED_ITEMS_KEY } from "../utils/cartUtils";
import { products as staticProducts } from "../data/products";

// Resolve the display ID of a cart item (same chain as rendering uses)
const resolveItemId = (item) => {
    return item.id || item.cart_item_id || item.row_id || item.cart_id || item.variation_id || item.product_id;
};

const getRemovedItems = () => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(REMOVED_ITEMS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
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
    } catch (e) { }
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

// Generate a stable key for a cart item - use ID_VARIANT for strict grouping
const getItemKey = (item) => {
    const productId = item.product_id || item.id;
    const variantId = item.variant_id || item.variation_id || item.variation?.id || item.variant?.id || "";
    
    if (productId) return `${productId}_${variantId}`;

    const slug = item.slug || item.product_slug || item.product?.slug;
    if (slug && typeof slug === 'string') return `${slug}_${variantId}`;

    return `unknown_${variantId}`;
};

const getSavedQuantities = () => {
    try {
        const stored = localStorage.getItem(CART_QUANTITIES_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) { return {}; }
};

export default function MyBagPage() {
    const router = useRouter();
    const { formatPrice } = useCurrency();

    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutStatus, setCheckoutStatus] = useState({ type: "", message: "" });

    const fetchCart = async () => {
        const token = localStorage.getItem("token");
        const GUEST_CART_KEY = "shri_divyam_guest_cart";
        
        if (!token) {
            // --- LOAD GUEST CART ---
            try {
                const guestCartStr = localStorage.getItem(GUEST_CART_KEY);
                let parsedItems = guestCartStr ? JSON.parse(guestCartStr) : [];
                
                // Filter and process guest items just like server items
                const filteredItems = filterRemovedItems(parsedItems);
                const savedQty = getSavedQuantities();
                const itemsWithCorrectQty = filteredItems.map(item => {
                    const exactKey = getItemKey(item);
                    const pId = String(item.product_id || item.id || '');
                    const matchingKey = Object.keys(savedQty).find(k => k === exactKey || k.startsWith(`${pId}_`));
                    
                    // Pre-enrich with static data for instant UI display
                    let enriched = { ...item, quantity: (matchingKey && savedQty[matchingKey]) || item.quantity || 1 };
                    if (staticProducts && staticProducts.length > 0) {
                        const found = staticProducts.find(p => String(p.id) === pId);
                        if (found) {
                            enriched = {
                                ...enriched,
                                product_name: enriched.product_name || found.title || found.name,
                                image_path: enriched.image_path || found.image,
                                price: enriched.price || found.price,
                                slug: enriched.slug || found.slug
                            };
                        }
                    }
                    return enriched;
                });

                // --- LOCAL RECOVERY START ---
                const existingKeys = new Set(itemsWithCorrectQty.map(it => getItemKey(it)));
                Object.entries(savedQty).forEach(([key, qty]) => {
                    if (Number(qty) > 0 && !existingKeys.has(key)) {
                        const [pId, vId] = key.split('_');
                        const isRemoved = filterRemovedItems([{ product_id: pId, variant_id: vId }]).length === 0;
                        if (!isRemoved) {
                            itemsWithCorrectQty.push({
                                product_id: pId,
                                variant_id: vId,
                                quantity: Number(qty),
                                _isPending: true
                            });
                        }
                    }
                });
                // --- LOCAL RECOVERY END ---

                setCartItems(itemsWithCorrectQty);
                // Also trigger full enrichment for dynamic data
                enrichItems(itemsWithCorrectQty);
                setIsLoading(false);
            } catch (e) {
                console.error("Guest cart load error:", e);
                setIsLoading(false);
            }
            return;
        }

        try {
            const response = await fetch("/api/proxy/cart", {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                cache: "no-store"
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
                } else if (rawItems && typeof rawItems === 'object') {
                    // Support transformed response from proxy (_original_items)
                    parsedItems = rawItems._original_items || (Array.isArray(rawItems.items) ? rawItems.items : []);
                }

                // ★ Filter out locally removed items so they don't reappear on refresh
                const filteredItems = filterRemovedItems(parsedItems);

                // --- AGGRESSIVE AUTO-CLEANUP START ---
                // If there are items on the server that we have removed locally, try to delete them from server again
                const ghostItems = parsedItems.filter(item => isItemRemoved(item));
                if (ghostItems.length > 0) {
                    console.log(`🧹 Auto-Cleanup: Found ${ghostItems.length} ghost items on server. Attempting removal...`);
                    
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
                }
                // --- AGGRESSIVE AUTO-CLEANUP END ---

                // ★ PRE-GROUPING ENRICHMENT
                // Raw API items often lack slugs/names. We must find them first to group correctly.
                const preEnrichedItems = filteredItems.map(item => {
                    const pId = String(item.product_id || item.id || '');
                    let enriched = { ...item };
                    
                    if (staticProducts && staticProducts.length > 0) {
                        const found = staticProducts.find(p => String(p.id) === pId);
                        if (found) {
                            enriched.slug = enriched.slug || found.slug;
                            enriched.product_name = enriched.product_name || found.title || found.name;
                            enriched.image_path = enriched.image_path || found.image;
                        }
                    }
                    return enriched;
                });

                // ★ OVERRIDE & GROUPING LOGIC
                // ★ GROUP BY PRODUCT_ID ONLY — prevents duplicate display when server has 2 entries
                //   for the same product (e.g. added via different components picking different variants)
                const savedQty = getSavedQuantities();
                const groupedMap = new Map(); // key = product_id (string)

                preEnrichedItems.forEach(item => {
                    const pId = String(item.product_id || item.id || '');
                    if (!pId) return;

                    const exactKey = getItemKey(item);

                    // Find any saved quantity for this product
                    const matchingKey = Object.keys(savedQty).find(k => k === exactKey || k.startsWith(`${pId}_`));

                    // Determine correct quantity
                    let finalQty = 1;
                    if (matchingKey && savedQty[matchingKey] !== undefined) {
                        finalQty = Number(savedQty[matchingKey]);
                    } else if (Number(item.quantity) > 0) {
                        finalQty = Number(item.quantity);
                    }

                    // ★ Use product_id as the group key to deduplicate same products with different variants
                    const groupKey = pId;

                    if (groupedMap.has(groupKey)) {
                        // DUPLICATE FOUND: Same product_id already in map (server returned 2 entries)
                        // Keep whichever has higher quantity. Don't double-count.
                        const existing = groupedMap.get(groupKey);
                        const existingQty = Number(existing.quantity) || 1;
                        if (finalQty > existingQty) {
                            groupedMap.set(groupKey, { ...item, quantity: finalQty });
                        }
                        // Otherwise keep existing (first/higher qty entry wins)
                    } else {
                        groupedMap.set(groupKey, { ...item, quantity: finalQty });
                    }
                });

                const itemsWithCorrectQty = Array.from(groupedMap.values());

                // --- LOCAL RECOVERY START ---
                // If there are items in local quantities that aren't in the list (maybe server is slow), add them
                Object.entries(savedQty).forEach(([key, qty]) => {
                    if (Number(qty) > 0) {
                        const underscoreIdx = key.indexOf('_');
                        if (underscoreIdx === -1) return;
                        const pId = key.substring(0, underscoreIdx);
                        const vId = key.substring(underscoreIdx + 1);

                        // Only add if not already shown AND not blacklisted
                        if (!groupedMap.has(pId)) {
                            const isRemoved = filterRemovedItems([{ product_id: pId, variant_id: vId }]).length === 0;
                            if (!isRemoved) {
                                itemsWithCorrectQty.push({
                                    product_id: pId,
                                    variant_id: vId,
                                    quantity: Number(qty),
                                    _isPending: true
                                });
                            }
                        }
                    }
                });
                // --- LOCAL RECOVERY END ---

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

    const handleCheckout = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        if (cartItems.length === 0) return;

        // Redirect to the checkout page where address selection happens
        router.push("/checkout");
    };

    // enrichment helper to fill in missing product data from all major categories
    const enrichItems = async (items) => {
        try {
            // First, enrich from staticProducts
            if (staticProducts && staticProducts.length > 0) {
                setCartItems(prev => prev.map(item => {
                    const pId = item.product_id || item.id;
                    const found = staticProducts.find(p => String(p.id) === String(pId));

                    if (found) {
                        return {
                            ...item,
                            product_name: item.product_name || item.name || found.title || found.name,
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

            // ★ PHASE 1.5: Fetch dynamic API products for items that are STILL missing names/images
            setCartItems(prev => {
                const stillMissing = prev.filter(it => !it.product_name && !it.name && !it.slug);
                if (stillMissing.length > 0) {
                    // Try to fetch all products to enrich dynamic ones
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
                            setCartItems(currentItems => currentItems.map(item => {
                                if (item.product_name || item.name) return item; // Already enriched
                                const pId = item.product_id || item.id;
                                const foundApi = pool.find(p => String(p.id) === String(pId));
                                if (foundApi) {
                                    return {
                                        ...item,
                                        product_name: item.product_name || item.name || foundApi.name || foundApi.title,
                                        image_path: item.image_path || item.image || foundApi.image_path || foundApi.image,
                                        slug: item.slug || foundApi.slug,
                                        price: item.price || foundApi.price,
                                        product: item.product || foundApi,
                                        stock: item.stock !== undefined ? item.stock : (foundApi.stock !== undefined ? foundApi.stock : null)
                                    };
                                }
                                return item;
                            }));
                        }
                        fetchVariantStocks();
                    }).catch(e => { console.error(e); fetchVariantStocks(); });
                    
                    return prev; // Return immediately, background fetch will update later
                } else {
                    // ★ PHASE 2: Fetch individual product details for accurate per-variant stock
                    fetchVariantStocks();
                    return prev;
                }
            });
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
                        fetch(`/api/proxy/products/${slug}`)
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

                                const variantStock = matchedVariation?.stock !== undefined ? Number(matchedVariation.stock) : null;
                                const productStock = detailedProduct.stock !== undefined ? Number(detailedProduct.stock) : null;
                                
                                // Auto-correct quantity if it exceeds max stock (Fixes exponential bug)
                                let currentQty = Number(item.quantity) || 1;
                                let maxStock = Infinity;
                                if (variantStock !== null) maxStock = variantStock;
                                else if (productStock !== null) maxStock = productStock;
                                else if (item.stock !== undefined) maxStock = Number(item.stock);
                                
                                if (maxStock !== Infinity && currentQty > maxStock) {
                                    // Auto-cap the quantity to maxStock to heal the user's cart
                                    currentQty = maxStock > 0 ? maxStock : 1;
                                    
                                    // Persist the fixed quantity to localStorage
                                    try {
                                        const quantities = getSavedQuantities();
                                        quantities[getItemKey(item)] = currentQty;
                                        localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));
                                    } catch(e) {}
                                }

                                return {
                                    ...item,
                                    quantity: currentQty,
                                    product: detailedProduct,
                                    _matchedVariation: matchedVariation,
                                    _stockFetched: true,
                                    _variantStock: variantStock,
                                    _productStock: productStock
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

    const handleClearBag = async () => {
        if (!confirm("Are you sure you want to clear your entire bag?")) return;
        
        const token = localStorage.getItem("token");
        
        // 1. Clear Local Storage
        localStorage.removeItem("shri_divyam_cart_quantities");
        localStorage.removeItem("shri_divyam_removed_cart_items");
        localStorage.removeItem("shri_divyam_removed_items");
        localStorage.removeItem("shri_divyam_guest_cart");
        
        // 2. Optimistic UI State
        const itemsToRemove = [...cartItems];
        setCartItems([]);
        window.dispatchEvent(new Event("cartUpdated"));

        // 3. If logged in, try to remove items from server too
        if (token) {
            setCheckoutStatus({ type: "success", message: "Hard-resetting your cart..." });
            
            // Call delete for each item to sync server
            try {
                await Promise.all(itemsToRemove.map(async (item) => {
                    const itemId = item.id || item.cart_item_id || item.row_id || item.cart_id;
                    const pId = item.product_id || item.id;
                    const vId = item.variant_id || item.variation_id || "";

                    const strategies = [
                        () => fetch(`/api/proxy/cart/remove`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                            body: JSON.stringify({ cart_item_id: itemId, product_id: pId, variant_id: vId, user_id: "1" })
                        }),
                        () => fetch(`/api/proxy/cart/${itemId}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        }),
                        () => fetch(`/api/proxy/cart/remove/${itemId}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        })
                    ];

                    for (const strategy of strategies) {
                        try {
                            const res = await strategy();
                            if (res.ok) break;
                        } catch (e) {}
                    }
                }));
            } catch (e) { console.error("Server clear error:", e); }
            
            setCheckoutStatus({ type: "success", message: "Bag cleared successfully." });
            setTimeout(() => {
                setCheckoutStatus({ type: "", message: "" });
                window.location.reload(); // Force reload to ensure everything is fresh
            }, 1500);
        } else {
            window.location.reload(); // Force reload for guests too
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        // Find the target item BEFORE removing
        const targetItem = cartItems.find((ci, idx) => {
            const id = ci.id || ci.cart_item_id || ci.row_id || ci.cart_id || ci.variation_id || ci.product_id;
            return id == cartItemId || `index-${idx}` == cartItemId;
        });

        if (!targetItem) return;

        // 1. Instant UI removal for everyone
        setCartItems(prev => prev.filter((it, idx) => {
            const id = it.id || it.cart_item_id || it.row_id || it.cart_id || it.variation_id || it.product_id;
            return id != cartItemId && `index-${idx}` != cartItemId;
        }));

        // 2. Delegate to cartUtils for backend and localStorage
        const variantId = targetItem.variant_id || targetItem.variation_id || "";
        await removeCartItem(targetItem, variantId);
    };

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        const foundItem = cartItems.find((ci, idx) => {
            const id = ci.id || ci.cart_item_id || ci.row_id || ci.cart_id || ci.variation_id || ci.product_id;
            return id == cartItemId || `index-${idx}` == cartItemId;
        });

        if (!foundItem) return;

        const targetQuantity = Number(newQuantity);
        const maxStock = getMaxStock(foundItem);
        const currentQuantity = Number(foundItem.quantity) || 1;
        
        if (maxStock !== Infinity && targetQuantity > maxStock && targetQuantity > currentQuantity) {
            return;
        }

        setUpdatingId(cartItemId);

        // 1. Optimistic UI Update
        const originalItems = [...cartItems];
        setCartItems(prev => prev.map((it, index) => {
            const currentItemId = it.id || it.cart_item_id || it.row_id || it.cart_id || it.variation_id || it.product_id || `index-${index}`;
            if (currentItemId == cartItemId) return { ...it, quantity: targetQuantity };
            return it;
        }));

        // 2. Delegate to cartUtils
        const variantId = foundItem.variant_id || foundItem.variation_id || "";
        const result = await updateCartItemQuantity(foundItem, targetQuantity, variantId);

        if (!result.success && localStorage.getItem("token")) {
            setCartItems(originalItems);
        }
        
        setUpdatingId(null);
    };

    // Get product image URL - Universal Resolver version
    const getImageUrl = (item) => {
        if (!item) return null;

        // Strategy 1: Known keys at various depths
        const knownKeys = ['image_path', 'image', 'product_image', 'thumbnail', 'product_details_image', 'img', 'pic'];

        const findImg = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            for (const key of knownKeys) {
                if (obj[key] && typeof obj[key] === 'string' && obj[key] !== "null") return obj[key];
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
            const foundKey = allKeys.find(k => (k.includes('image') || k.includes('path') || k.includes('thumb')) && item[k] && typeof item[k] === 'string' && item[k] !== "null");
            if (foundKey) img = item[foundKey];
        }

        if (!img) return null;

        // Handle full URLs
        if (typeof img === 'string' && (img.startsWith("http") || img.startsWith("//") || img.startsWith("data:"))) {
            return img;
        }

        // Handle relative paths
        let cleanImg = typeof img === 'string' ? img : (img?.image || img?.image_path || '');
        if (!cleanImg || cleanImg === "null") return null;

        // Strip leading slash if present
        if (cleanImg.startsWith('/')) {
            cleanImg = cleanImg.slice(1);
        }
        
        // If the path already includes 'uploads/', avoid duplicating it
        if (cleanImg.startsWith('uploads/')) {
            return "https://shreedivyam.kdscrm.com/" + cleanImg;
        }
        
        // If it starts with storage, it's likely a different base
        if (cleanImg.startsWith('storage/')) {
            return "https://shreedivyam.kdscrm.com/" + cleanImg;
        }

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

        // Strategy 4: Product ID Fallback
        if (!name) {
            const pId = item.product_id || item.id;
            if (pId) {
                return `Product #${pId}`;
            }
        }

        return name || "Premium Product";
    };

    // Get item price formatted for display
    const getItemPrice = (item) => {
        let price = item.price || item.product?.price || item.variant?.price || item.variation?.price || 0;
        let usdPrice = item.usd_price || item.product?.usd_price || item.variant?.usd_price || 0;
        
        // Sanitize string prices to numbers if needed
        if (typeof price === 'string') price = price.replace(/[^\d.]/g, '');
        if (typeof usdPrice === 'string') usdPrice = usdPrice.replace(/[^\d.]/g, '');
        
        return formatPrice(Number(price), Number(usdPrice));
    };

    // Get raw price (always returns number in INR for calculation base)
    const getRawPrice = (item) => {
        let price = item.price || item.product?.price || item.variant?.price || item.variation?.price || 0;
        if (typeof price === 'string') price = price.replace(/[^\d.]/g, '');
        const num = Number(price);
        return isNaN(num) ? 0 : num;
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

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-[#303030] relative inline-block">
                            My Shopping Bag
                            <span className="absolute -bottom-2 left-0 w-16 h-1 bg-[#7A1F3D]"></span>
                        </h1>
                        
                        {cartItems.length > 0 && (
                            <button 
                                onClick={handleClearBag}
                                className="text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition flex items-center gap-2 px-3 py-1.5 border border-red-100 hover:border-red-200 bg-red-50/50 rounded-sm self-start sm:self-auto"
                            >
                                <Trash2 size={14} />
                                Clear Entire Bag
                            </button>
                        )}
                    </div>

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
                            <Link href="/#premium-collections">
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
                                                </div>
                                                {variantInfo && (
                                                    <p className="text-[11px] text-gray-400 mb-2 uppercase tracking-wider font-medium">{variantInfo}</p>
                                                )}
                                                <p className="text-lg font-bold text-[#7A1F3D] mb-3">{getItemPrice(item)}</p>

                                                {/* Stock Info Badge */}
                                                {maxStock !== Infinity && (
                                                    <div className="mb-2">
                                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border ${maxStock <= 0
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
                                </div>

                                <div className="pt-4 border-t-[2px] border-[#E8DDD4] flex justify-between items-end mb-6">
                                    <div>
                                        <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">Total Amount</span>
                                        <span className="font-bold text-[#303030] text-lg uppercase">Grand Total</span>
                                    </div>
                                    <span className="font-bold text-[#7A1F3D] text-3xl tracking-tight">{formatPrice(totalPrice, 0)}</span>
                                </div>

                                {checkoutStatus.message && (
                                    <div className={`mb-6 p-4 rounded-sm flex items-start gap-3 animate-in fade-in duration-300 ${checkoutStatus.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                        <p className="text-[13px] font-medium leading-tight">{checkoutStatus.message}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={cartItems.length === 0}
                                    className="w-full py-4 bg-[#7A1F3D] text-white font-bold uppercase tracking-[0.25em] text-[13px] hover:bg-[#5E182F] transition-all flex items-center justify-center gap-3 rounded-sm shadow-[0_10px_20px_-10px_rgba(122,31,61,0.3)] active:scale-[0.98]"
                                >
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
