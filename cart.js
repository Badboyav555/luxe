// Local Storage Backed Core Cart Logic Modules Engine
function addToCart(product, size) {
    let cart = JSON.parse(localStorage.getItem('luxe_cart')) || [];
    
    const duplicateIndex = cart.findIndex(item => item.id === product.id && item.size === size);
    if(duplicateIndex > -1) {
        cart[duplicateIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            discounted_price: product.discounted_price,
            original_price: product.original_price,
            size: size,
            quantity: 1,
            image: product.images[0]
        });
    }
    
    localStorage.setItem('luxe_cart', JSON.stringify(cart));
    syncCartStateBadge();
    showToast(`${product.name} (${size}) packed into cart.`);
}

function updateCartQuantity(productId, size, offset) {
    let cart = JSON.parse(localStorage.getItem('luxe_cart')) || [];
    const targetIdx = cart.findIndex(item => item.id === productId && item.size === size);
    
    if(targetIdx > -1) {
        cart[targetIdx].quantity += offset;
        if(cart[targetIdx].quantity <= 0) {
            cart.splice(targetIdx, 1);
        }
        localStorage.setItem('luxe_cart', JSON.stringify(cart));
        syncCartStateBadge();
        if(typeof runCheckoutRender === "function") runCheckoutRender();
    }
}
