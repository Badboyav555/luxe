// System product listings render controls pipeline
async function renderHomepageProducts() {
    const productsGrid = document.getElementById('productsDisplayGrid');
    if(!productsGrid) return;

    // Load Banner Carousel Items
    const { data: banners } = await _supabase.from('banners').select('*');
    const bannerContainer = document.getElementById('bannerContainer');
    if(bannerContainer && banners && banners.length > 0) {
        bannerContainer.innerHTML = banners.map(b => `
            <img src="${b.image_url}" style="width:100%; height:100%; object-fit:cover; border-radius:12px; display:block;" alt="Promo Banner">
        `).join('');
    } else if (bannerContainer) {
        bannerContainer.innerHTML = `<div style="background:linear-gradient(90deg, #1f1f26, #2d2d38); width:100%; height:100%; border-radius:12px; display:flex; align-items:center; justify-content:center;">⚡ SEASONAL CLEARANCE LUXURY WAVE 70% OFF ⚡</div>`;
    }

    // Capture Category Data Items dynamically to build system filters matrix array
    let query = _supabase.from('products').select('*');
    
    // Dynamic Filter Hooks Checks Extensions
    const catFilter = document.getElementById('filterCategory');
    const priceFilter = document.getElementById('filterPrice');
    const searchInput = document.getElementById('globalSearchInput');

    let { data: allProducts, error } = await query;
    if(error) { productsGrid.innerHTML = `<p>Failure loading inventory pipelines</p>`; return; }

    // Seed Categories dropdown
    if(catFilter && catFilter.options.length <= 1) {
        const uniqueCats = [...new Set(allProducts.map(p => p.category))];
        uniqueCats.forEach(c => {
            let opt = document.createElement('option');
            opt.value = c; opt.innerText = c; catFilter.appendChild(opt);
        });
    }

    // Apply front-end filtering for dynamic responsiveness
    let workingSet = [...allProducts];

    if(catFilter && catFilter.value) workingSet = workingSet.filter(p => p.category === catFilter.value);
    if(searchInput && searchInput.value) workingSet = workingSet.filter(p => p.name.toLowerCase().includes(searchInput.value.toLowerCase()));
    if(priceFilter && priceFilter.value) {
        if(priceFilter.value === '0-500') workingSet = workingSet.filter(p => p.discounted_price <= 500);
        if(priceFilter.value === '500-1500') workingSet = workingSet.filter(p => p.discounted_price > 500 && p.discounted_price <= 1500);
        if(priceFilter.value === '1500+') workingSet = workingSet.filter(p => p.discounted_price > 1500);
    }

    if(workingSet.length === 0) { productsGrid.innerHTML = `<p style="padding:20px; color:var(--text-muted);">No products match criteria.</p>`; return; }

    productsGrid.innerHTML = workingSet.map(p => `
        <div class="glass-card" style="padding:12px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="location.href='product.html?id=${p.id}'">
            <div style="position:relative;">
                <img src="${p.images[0] || 'https://via.placeholder.com/300'}" style="width:100%; height:180px; object-fit:cover; border-radius:10px;" loading="lazy">
                <span style="position:absolute; top:8px; left:8px; background:var(--accent-pink); font-size:10px; padding:3px 6px; border-radius:4px; font-weight:700;">${p.discount_percentage}% OFF</span>
            </div>
            <h3 style="font-size:14px; margin:10px 0 5px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</h3>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                <span style="color:var(--text-main); font-weight:700; font-size:15px;">₹${p.discounted_price}</span>
                <span style="color:var(--text-muted); text-decoration:line-through; font-size:12px;">₹${p.original_price}</span>
            </div>
            <button class="btn-primary" style="width:100%; font-size:12px; padding:8px 0; border-radius:6px;" onclick="event.stopPropagation(); location.href='product.html?id=${p.id}'">View Deal</button>
        </div>
    `).join('');
}

// Bind live filter events directly to interface interactions
document.addEventListener("DOMContentLoaded", () => {
    const catF = document.getElementById('filterCategory');
    const prF = document.getElementById('filterPrice');
    const sIn = document.getElementById('globalSearchInput');

    if(catF) catF.onchange = renderHomepageProducts;
    if(prF) prF.onchange = renderHomepageProducts;
    if(sIn) sIn.oninput = renderHomepageProducts;

    renderHomepageProducts();
});

async function toggleWishlist(productId) {
    const user = _supabase.auth.user();
    if(!user) { showToast('Login to save bookmarks.'); window.location.href='login.html'; return; }

    const { data: existing } = await _supabase.from('wishlists').select('*').eq('user_id', user.id).eq('product_id', productId).maybeSingle();
    if(existing) {
        await _supabase.from('wishlists').delete().eq('id', existing.id);
        showToast('Item removed from wishlist');
    } else {
        await _supabase.from('wishlists').insert([{user_id: user.id, product_id: productId}]);
        showToast('Item added to wishlist pipeline');
    }
}
