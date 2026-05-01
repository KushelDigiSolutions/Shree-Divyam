
/**
 * Utility functions for cart management
 */

export const GUEST_CART_KEY = "shri_divyam_guest_cart";
export const CART_QUANTITIES_KEY = "shri_divyam_cart_quantities";
export const REMOVED_ITEMS_KEY = "shri_divyam_removed_cart_items";

/**
 * Syncs the guest cart to the logged-in user's cart upon login.
 * - New items → ADD to server
 * - Existing items with wrong qty → UPDATE server to match guest qty
 * - Then rebuild CART_QUANTITIES_KEY from guest data (source of truth)
 */
export const syncGuestCartToUser = async (token, userIdStr) => {
    try {
        const guestCartStr = localStorage.getItem(GUEST_CART_KEY);
        if (!guestCartStr) return { success: true };
        
        const guestCart = JSON.parse(guestCartStr);
        if (!guestCart || guestCart.length === 0) return { success: true };

        // Step 1: Fetch current server cart
        let serverItems = [];
        try {
            const res = await fetch("/api/proxy/cart", {
                headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
            });
            
            if (res.ok) {
                const data = await res.json();
                const cartData = data.cart || data.data || {};
                const items = cartData._original_items || (Array.isArray(cartData.items) ? cartData.items : (data.cart_items || []));
                serverItems = Array.isArray(items) ? items : [];
            }
        } catch (e) {
            console.error("Failed to fetch server cart during sync:", e);
        }

        // Step 2: For each guest item, either ADD or UPDATE on server
        for (const item of guestCart) {
            const pId = String(item.product_id);
            const vId = item.variant_id ? String(item.variant_id) : "";
            const guestQty = Number(item.quantity) || 1;

            // Check if this product already exists on server
            const serverItem = serverItems.find(si => 
                String(si.product_id || si.id || '') === pId
            );

            if (serverItem) {
                // Item EXISTS on server — check if qty matches
                const serverQty = Number(serverItem.quantity || 1);
                if (serverQty !== guestQty) {
                    // Server has wrong qty — UPDATE it to match guest
                    const cartItemId = serverItem.id || serverItem.cart_item_id || serverItem.row_id || serverItem.cart_id;
                    if (cartItemId) {
                        try {
                            // Try multiple update strategies
                            const strategies = [
                                async () => fetch(`/api/proxy/cart/${cartItemId}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                                    body: JSON.stringify({ quantity: guestQty, user_id: userIdStr })
                                }),
                                async () => {
                                    const body = new URLSearchParams();
                                    body.append('quantity', String(guestQty));
                                    body.append('user_id', userIdStr);
                                    return fetch(`/api/proxy/cart/${cartItemId}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                                        body: body.toString()
                                    });
                                }
                            ];
                            for (const strategy of strategies) {
                                try {
                                    const res = await strategy();
                                    if (res.ok) break;
                                } catch (e) {}
                            }
                        } catch (e) {
                            console.error("Failed to update server qty for product:", pId, e);
                        }
                    }
                }
                // Skip adding — item already on server (qty now corrected)
            } else {
                // Item NOT on server — ADD it
                try {
                    const body = new URLSearchParams();
                    body.append('user_id', userIdStr);
                    body.append('product_id', pId);
                    body.append('variant_id', vId || "1");
                    body.append('quantity', String(guestQty));
                    
                    await fetch("/api/proxy/cart/add", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                        body: body.toString()
                    });
                } catch (e) {
                    console.error("Failed to add guest item:", item, e);
                }
            }
        }

        // Step 3: Rebuild CART_QUANTITIES_KEY from GUEST data (source of truth, not server)
        const newQuantities = {};
        guestCart.forEach(item => {
            const localKeyId = String(item.product_id);
            let vId = item.variant_id ? String(item.variant_id) : "";
            if (vId === "null" || vId === "undefined") vId = "";
            const key = `${localKeyId}_${vId}`;
            newQuantities[key] = Number(item.quantity) || 1;
        });
        localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(newQuantities));

        // Step 4: Clear guest cart
        localStorage.removeItem(GUEST_CART_KEY);
        
        // Dispatch event so Header updates immediately with correct guest quantities
        window.dispatchEvent(new Event("cartUpdated"));
        
        return { success: true };
    } catch (error) {
        console.error("Sync Guest Cart Error:", error);
        return { success: false };
    }
};

/**
 * Adds a product to the cart (guest or logged-in)
 * @param {Object} product - The product object
 * @param {number} quantity - Quantity to add
 * @param {number|string|null} forcedVariantId - Optional variant ID to use
 * @returns {Promise<Object>} - Status and message
 */
export const addToCart = async (product, quantity = 1, forcedVariantId = null) => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        // Use name or slug for local isolation to prevent cross-product quantity bugs
        const localKeyId = String(product.id || product.product_id || product.productID || 0);
        // Use only numeric IDs for the server
        const serverId = product.id || product.product_id || product.productID || 0;
        const slug = product.slug;

        let variantId = forcedVariantId;

        if (!variantId) {
            // 1. Fetch full product info to get variants if not provided
            let variants = product.variations || product.variants || [];
            if (variants.length === 0 && slug) {
                const res = await fetch(`/api/proxy/products/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    variants = data.product?.variations || data.product?.variants || [];
                }
            }

            // 2. Select first in-stock variant
            let selectedVariant = variants.find(v => Number(v.stock) > 0);
            if (!selectedVariant && variants.length > 0) {
                selectedVariant = variants[0];
            }

            variantId = selectedVariant?.id || "";
        }

        // 3. Clear from removed blacklist
        if (typeof window !== 'undefined') {
            try {
                const removed = JSON.parse(localStorage.getItem(REMOVED_ITEMS_KEY) || "[]");
                const filtered = removed.filter(r => String(r.pId) !== String(serverId));
                localStorage.setItem(REMOVED_ITEMS_KEY, JSON.stringify(filtered));
            } catch (e) { }
        }

        // NOTE: Guest sync is now handled exclusively by AuthContext on login
        // to prevent double-add bugs during normal shopping.
        if (!token || token === "dummy-token-for-now") {
            // --- GUEST MODE ---
            const guestCartStr = localStorage.getItem(GUEST_CART_KEY);
            let guestCart = guestCartStr ? JSON.parse(guestCartStr) : [];
            
            const existingIndex = guestCart.findIndex(it => {
                return String(it.product_id) === String(serverId) && 
                       String(it.variant_id) === String(variantId);
            });

            if (existingIndex > -1) {
                guestCart[existingIndex].quantity = Number(guestCart[existingIndex].quantity) + quantity;
                // Update slug/ids if they were missing or different
                guestCart[existingIndex].slug = slug || guestCart[existingIndex].slug;
                guestCart[existingIndex].product_id = serverId;
            } else {
                guestCart.push({
                    product_id: serverId,
                    variant_id: variantId,
                    slug: slug,
                    quantity: quantity,
                    added_at: new Date().toISOString()
                });
            }

            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
            
            // Set quantity from GUEST_CART_KEY (source of truth) — NOT += to avoid stale data doubling
            const qtyStored = localStorage.getItem(CART_QUANTITIES_KEY);
            const quantities = qtyStored ? JSON.parse(qtyStored) : {};
            let vIdToSave = variantId;
            if (vIdToSave === null || vIdToSave === undefined || vIdToSave === "null" || vIdToSave === "undefined") vIdToSave = "";
            const key = `${localKeyId}_${vIdToSave}`;
            
            // Use the guest cart's actual quantity for this specific variant
            const guestItem = guestCart.find(it => 
                String(it.product_id) === String(serverId) && 
                String(it.variant_id || "") === String(vIdToSave)
            );
            quantities[key] = guestItem ? Number(guestItem.quantity) : quantity;
            localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));

            window.dispatchEvent(new Event("cartUpdated"));
            return { success: true, message: "Added to Bag!" };
        } else {
        // --- LOGGED-IN MODE ---
        let userId = "";
        try {
            const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
            if (userStr) {
                const userData = JSON.parse(userStr);
                userId = userData.id || userData.user_id || userData.userid || "1";
            } else {
                userId = "1";
            }
        } catch (e) { userId = "1"; }

            const userIdStr = String(userId);

            // ★ DUPLICATE PREVENTION: Check if this product already exists in server cart
            // This prevents the bug where same product from different components creates 2 cart entries
            let existingCartItem = null;
            let existingVariantId = null;
            try {
                const cartCheckRes = await fetch("/api/proxy/cart", {
                    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
                    cache: "no-store"
                });
                if (cartCheckRes.ok) {
                    const cartCheckData = await cartCheckRes.json();
                    const rawItems = cartCheckData.cart_items || cartCheckData.cart || cartCheckData.items || cartCheckData.data || [];
                    let parsedItems = Array.isArray(rawItems)
                        ? rawItems
                        : (rawItems._original_items || (Array.isArray(rawItems.items) ? rawItems.items : []));

                    // Find by product_id ONLY — prevents duplicate entries regardless of variant picked
                    existingCartItem = parsedItems.find(it =>
                        String(it.product_id || it.id || "") === String(serverId)
                    );
                    if (existingCartItem) {
                        existingVariantId = existingCartItem.variant_id || existingCartItem.variation_id || null;
                    }
                }
            } catch (e) {
                console.warn("Cart pre-check failed, proceeding with add:", e);
            }

            // If product already in server cart — UPDATE quantity, don't add a new entry
            if (existingCartItem) {
                const cartItemId = existingCartItem.id || existingCartItem.cart_item_id || existingCartItem.row_id || existingCartItem.cart_id;
                const currentServerQty = Number(existingCartItem.quantity || 1);
                const newQty = currentServerQty + quantity;

                let updateSuccess = false;
                const updateStrategies = [
                    async () => fetch(`/api/proxy/cart/update`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ cart_item_id: cartItemId, product_id: Number(serverId), variant_id: existingVariantId ? Number(existingVariantId) : undefined, quantity: newQty, user_id: userIdStr })
                    }),
                    async () => fetch(`/api/proxy/cart/update-quantity`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ cart_item_id: cartItemId, quantity: newQty, user_id: userIdStr })
                    }),
                    async () => fetch(`/api/proxy/cart/${cartItemId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ quantity: newQty, user_id: userIdStr })
                    }),
                    async () => fetch(`/api/proxy/cart/update/${cartItemId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ quantity: newQty, user_id: userIdStr })
                    }),
                ];

                for (const strategy of updateStrategies) {
                    try {
                        const res = await strategy();
                        if (res.ok) { updateSuccess = true; break; }
                    } catch (e) {}
                }

                // Update localStorage with the existing variant key (not a new one)
                const qtyStored = localStorage.getItem(CART_QUANTITIES_KEY);
                const quantities = qtyStored ? JSON.parse(qtyStored) : {};
                let vIdToSave = existingVariantId ? String(existingVariantId) : "";
                if (vIdToSave === "null" || vIdToSave === "undefined") vIdToSave = "";
                const key = `${localKeyId}_${vIdToSave}`;
                quantities[key] = newQty;
                localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));

                window.dispatchEvent(new Event("cartUpdated"));
                return { success: true, message: updateSuccess ? "Cart updated!" : "Added to Bag!" };
            }

            // Product NOT in cart yet — proceed with normal add
            const vIdStr = variantId ? String(Number(variantId)) : "1";

            let success = false;
            let apiData = {};
            try {
                const response = await fetch("/api/proxy/cart/add", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json", 
                        "Accept": "application/json", 
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify({ 
                        product_id: Number(serverId), 
                        variant_id: Number(vIdStr), 
                        quantity: Number(quantity), 
                        user_id: userIdStr 
                    })
                });
                
                if (response.ok) {
                    apiData = await response.json();
                    if (apiData.status === 'success' || apiData.success || apiData.message?.toLowerCase().includes('added')) {
                        success = true;
                    }
                } else {
                    try { apiData = await response.json(); } catch(e) {}
                }
            } catch (e) {
                console.error("Add to cart error:", e);
            }

            if (success) {
                const qtyStored = localStorage.getItem(CART_QUANTITIES_KEY);
                const quantities = qtyStored ? JSON.parse(qtyStored) : {};
                let vIdToSave = variantId;
                if (vIdToSave === null || vIdToSave === undefined || vIdToSave === "null" || vIdToSave === "undefined") vIdToSave = "";
                const key = `${localKeyId}_${vIdToSave}`;
                quantities[key] = quantity; // set exact qty, don't accumulate
                localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));
                
                window.dispatchEvent(new Event("cartUpdated"));
                return { success: true, message: apiData.message || "Added to Bag!" };
            } else {
                return { success: false, message: apiData.message || "Failed to add to cart." };
            }
        }
    } catch (error) {
        console.error("Direct Add to Cart Error:", error);
        return { success: false, message: "An error occurred." };
    }
}

/**
 * Gets the specific quantity and variantId of a product in the cart locally.
 */
export const getCartItemQuantity = (product, targetVariantId = null) => {
    try {
        const stored = localStorage.getItem(CART_QUANTITIES_KEY);
        if (!stored) return { quantity: 0, variantId: null };
        const quantities = JSON.parse(stored);
        
        const serverId = product.id || product.product_id || product.productID;
        if (!serverId || String(serverId) === '0') return { quantity: 0, variantId: null };
        
        const localKeyId = String(serverId);
        
        // If we have a specific target, check it first
        if (targetVariantId !== null && targetVariantId !== undefined) {
            let vId = String(targetVariantId);
            if (vId === "null" || vId === "undefined") vId = "";
            const key = `${localKeyId}_${vId}`;
            if (quantities[key] !== undefined) {
                return { quantity: Number(quantities[key]), variantId: vId || null };
            }
        }

        // Fallback: Scan for any variant of this product
        let foundQty = 0;
        let foundVariant = null;
        
        Object.entries(quantities).forEach(([key, val]) => {
            if (Number(val) <= 0) return;
            const underscoreIdx = key.indexOf('_');
            if (underscoreIdx === -1) return;
            
            const keyProductId = key.substring(0, underscoreIdx);
            const keyVariantId = key.substring(underscoreIdx + 1);
            
            if (keyProductId === localKeyId) {
                // If we didn't have a target, or it wasn't found, pick the first one we see
                if (!foundVariant) {
                    foundQty = Number(val);
                    foundVariant = keyVariantId || null;
                    if (foundVariant === "null" || foundVariant === "undefined" || foundVariant === "") foundVariant = null;
                }
            }
        });
        
        return { quantity: foundQty, variantId: foundVariant };
    } catch(e) {
        return { quantity: 0, variantId: null };
    }
};

/**
 * Updates the quantity of a product in the cart
 */
export const updateCartItemQuantity = async (product, targetQuantity, forcedVariantId = undefined) => {
    try {
        if (targetQuantity < 1) return { success: false, message: "Quantity must be at least 1" };
        
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        
        // Use name or slug for local isolation to prevent cross-product quantity bugs
        const localKeyId = String(product.id || product.product_id || product.productID || 0);
        // Use only numeric IDs for the server
        const serverId = product.id || product.product_id || product.productID || 0;
        
        const slug = product.slug;

        let variantId = forcedVariantId;

        if (forcedVariantId === undefined) {
            let variants = product.variations || product.variants || [];
            if (variants.length === 0 && slug) {
                try {
                    const res = await fetch(`/api/proxy/products/${slug}`);
                    if (res.ok) {
                        const data = await res.json();
                        variants = data.product?.variations || data.product?.variants || [];
                    }
                } catch(e) {}
            }
            let selectedVariant = variants.find(v => Number(v.stock) > 0);
            if (!selectedVariant && variants.length > 0) {
                selectedVariant = variants[0];
            }
            variantId = selectedVariant?.id || "";
        }

        // --- GUEST MODE ---
        if (!token || token === "dummy-token-for-now") {
            const guestCartStr = localStorage.getItem(GUEST_CART_KEY);
            let guestCart = guestCartStr ? JSON.parse(guestCartStr) : [];
            
            const existingIndex = guestCart.findIndex(it => 
                String(it.product_id) === String(serverId) && 
                String(it.variant_id) === String(variantId)
            );

            if (existingIndex > -1) {
                guestCart[existingIndex].quantity = targetQuantity;
            } else {
                guestCart.push({
                    product_id: serverId,
                    variant_id: variantId,
                    quantity: targetQuantity,
                    added_at: new Date().toISOString()
                });
            }

            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
            
            // Update quantities override
            const qtyStored = localStorage.getItem(CART_QUANTITIES_KEY);
            const quantities = qtyStored ? JSON.parse(qtyStored) : {};
            
            Object.keys(quantities).forEach(k => {
                if (k.startsWith(`${localKeyId}_`)) {
                    delete quantities[k];
                }
            });
            
            let vIdToSave = variantId;
            if (vIdToSave === null || vIdToSave === undefined || vIdToSave === "null" || vIdToSave === "undefined") vIdToSave = "";
            const key = `${localKeyId}_${vIdToSave}`;
            quantities[key] = targetQuantity;
            localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));

            window.dispatchEvent(new Event("cartUpdated"));
            return { success: true };
        } 
        
        // --- LOGGED-IN MODE ---
        // 1. Fetch current cart to get cart_item_id
        const cartRes = await fetch("/api/proxy/cart", {
            headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
        });
        if (!cartRes.ok) return { success: false, message: "Failed to fetch cart" };
        
        const cartData = await cartRes.json();
        const rawItems = cartData.cart_items || cartData.cart || cartData.items || cartData.data || [];
        let parsedItems = Array.isArray(rawItems) ? rawItems : (rawItems._original_items || (Array.isArray(rawItems.items) ? rawItems.items : []));
        
        // Find the item
        const foundItem = parsedItems.find(it => 
            String(it.product_id || it.id) === String(serverId) && 
            (variantId ? String(it.variant_id || it.variation_id) === String(variantId) : true)
        );
        
        if (!foundItem) {
            // If not in cart, add it by calling the backend, but SET the local quantity
            try {
                const payload = {
                    product_id: Number(serverId),
                    variant_id: variantId ? Number(variantId) : null,
                    quantity: Number(targetQuantity)
                };

                const response = await fetch("/api/proxy/cart/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const qtyStored = localStorage.getItem(CART_QUANTITIES_KEY);
                    const quantities = qtyStored ? JSON.parse(qtyStored) : {};
                    const key = `${localKeyId}_${variantId}`;
                    quantities[key] = targetQuantity;
                    localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));
                    window.dispatchEvent(new Event("cartUpdated"));
                    return { success: true };
                }
            } catch(e) { }
            return { success: false, message: "Failed to update item." };
        }
        
        const cartItemId = foundItem.id || foundItem.cart_item_id || foundItem.row_id || foundItem.cart_id;
        let userId = "";
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const userData = JSON.parse(userStr);
                userId = userData.id || userData.user_id || userData.userid || "";
            }
            if (!userId) userId = "1";
        } catch (e) { userId = "1"; }
        
        // Update locally first for optimistic UI
        const qtyStored = localStorage.getItem(CART_QUANTITIES_KEY);
        const quantities = qtyStored ? JSON.parse(qtyStored) : {};
        
        // Remove any other variant keys for this product to prevent duplicate tracking
        Object.keys(quantities).forEach(k => {
            if (k.startsWith(`${localKeyId}_`)) {
                delete quantities[k];
            }
        });
        
        let vIdToSave = variantId;
        if (vIdToSave === null || vIdToSave === undefined || vIdToSave === "null" || vIdToSave === "undefined") vIdToSave = "";
        const key = `${localKeyId}_${vIdToSave}`;
        quantities[key] = targetQuantity;
        localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));
        window.dispatchEvent(new Event("cartUpdated"));
        
        // Fire all update strategies (like in my-bag)
        const userIdStr = String(userId);
        const strategies = [
            async () => fetch(`/api/proxy/cart/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    cart_item_id: cartItemId,
                    product_id: foundItem?.product_id,
                    variant_id: String(variantId),
                    quantity: targetQuantity,
                    user_id: userIdStr
                })
            }),
            async () => fetch(`/api/proxy/cart/update-quantity`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "Accept": "application/json" },
                body: JSON.stringify({ 
                    cart_item_id: cartItemId, 
                    product_id: foundItem?.product_id,
                    quantity: targetQuantity,
                    user_id: userIdStr
                })
            }),
            async () => fetch(`/api/proxy/cart/update/${cartItemId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ quantity: targetQuantity, user_id: userIdStr })
            }),
            async () => fetch(`/api/proxy/cart/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    user_id: userIdStr,
                    product_id: Number(foundItem?.product_id || serverId || 0),
                    variant_id: Number(variantId),
                    quantity: Number(targetQuantity)
                })
            }),
            async () => {
                const body = new URLSearchParams();
                body.append('user_id', userIdStr);
                body.append('product_id', String(foundItem?.product_id || serverId || 0));
                body.append('variant_id', String(variantId));
                body.append('quantity', String(targetQuantity));
                return fetch(`/api/proxy/cart/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                    body: body.toString()
                });
            }
        ];

        for (const strategy of strategies) {
            try {
                const response = await strategy();
                if (response.ok) return { success: true };
            } catch (e) {}
        }
        
        return { success: false, message: "Update failed." };

    } catch (error) {
        console.error("Direct Update Cart Error:", error);
        return { success: false, message: "An error occurred." };
    }
};

/**
 * Removes a product completely from the cart
 */
export const removeCartItem = async (product, forcedVariantId = undefined) => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        // Use name or slug for local isolation to prevent cross-product quantity bugs
        const localKeyId = String(product.id || product.product_id || product.productID || 0);
        // Use only numeric IDs for the server
        const serverId = product.id || product.product_id || product.productID || 0;
        const slug = product.slug;

        let variantId = forcedVariantId;

        if (forcedVariantId === undefined) {
            let variants = product.variations || product.variants || [];
            if (variants.length === 0 && slug) {
                try {
                    const res = await fetch(`/api/proxy/products/${slug}`);
                    if (res.ok) {
                        const data = await res.json();
                        variants = data.product?.variations || data.product?.variants || [];
                    }
                } catch(e) {}
            }
            let selectedVariant = variants.find(v => Number(v.stock) > 0);
            if (!selectedVariant && variants.length > 0) {
                selectedVariant = variants[0];
            }
            variantId = selectedVariant?.id || "";
        }

        // --- GUEST MODE ---
        if (!token || token === "dummy-token-for-now") {
            const guestCartStr = localStorage.getItem(GUEST_CART_KEY);
            let guestCart = guestCartStr ? JSON.parse(guestCartStr) : [];
            
            guestCart = guestCart.filter(it => 
                !(String(it.product_id) === String(serverId) && String(it.variant_id) === String(variantId))
            );

            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
            
            // Remove from quantities
            const qtyStored = localStorage.getItem(CART_QUANTITIES_KEY);
            const quantities = qtyStored ? JSON.parse(qtyStored) : {};
            let vIdToSave = variantId;
            if (vIdToSave === null || vIdToSave === undefined || vIdToSave === "null" || vIdToSave === "undefined") vIdToSave = "";
            const key = `${localKeyId}_${vIdToSave}`;
            delete quantities[key];
            localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));

            window.dispatchEvent(new Event("cartUpdated"));
            return { success: true };
        } 
        
        // --- LOGGED-IN MODE ---
        // Fetch current cart to get cart_item_id
        const cartRes = await fetch("/api/proxy/cart", {
            headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
        });
        if (!cartRes.ok) return { success: false, message: "Failed to fetch cart" };
        
        const cartData = await cartRes.json();
        const rawItems = cartData.cart_items || cartData.cart || cartData.items || cartData.data || [];
        let parsedItems = Array.isArray(rawItems) ? rawItems : (rawItems._original_items || (Array.isArray(rawItems.items) ? rawItems.items : []));
        
        const foundItem = parsedItems.find(it => 
            String(it.product_id || it.id) === String(serverId) && 
            (variantId ? String(it.variant_id || it.variation_id) === String(variantId) : true)
        );
        
        // Update locally FIRST
        const qtyStored = localStorage.getItem(CART_QUANTITIES_KEY);
        const quantities = qtyStored ? JSON.parse(qtyStored) : {};
        Object.keys(quantities).forEach(k => {
            if (k.startsWith(`${localKeyId}_`)) {
                delete quantities[k];
            }
        });
        localStorage.setItem(CART_QUANTITIES_KEY, JSON.stringify(quantities));
        
        // Blacklist it locally FIRST
        try {
            const removedStr = localStorage.getItem(REMOVED_ITEMS_KEY) || "[]";
            const removed = JSON.parse(removedStr);
            const exists = removed.some(r => r.pId === String(serverId) && String(r.vId) === String(variantId));
            if (!exists) {
                removed.push({ pId: String(serverId), vId: String(variantId), time: Date.now() });
                localStorage.setItem(REMOVED_ITEMS_KEY, JSON.stringify(removed));
            }
        } catch(e) {}
        
        window.dispatchEvent(new Event("cartUpdated"));

        if (!foundItem) return { success: true };
        
        const cartItemId = foundItem.id || foundItem.cart_item_id || foundItem.row_id || foundItem.cart_id;
        
        // Multi-strategy removal to ensure server sync
        const strategies = [
            () => fetch(`/api/proxy/cart/remove`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ cart_item_id: cartItemId, id: cartItemId, product_id: serverId, variant_id: variantId, user_id: "1" })
            }),
            () => fetch(`/api/proxy/cart/${cartItemId}`, {
                method: "DELETE",
                headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
            }),
            () => fetch(`/api/proxy/cart/remove/${cartItemId}`, {
                method: "DELETE",
                headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
            })
        ];

        for (const strategy of strategies) {
            try {
                const res = await strategy();
                if (res.ok) break;
            } catch (e) {}
        }

        return { success: true };
    } catch (error) {
        console.error("Direct Remove Cart Error:", error);
        return { success: false, message: "An error occurred." };
    }
};
