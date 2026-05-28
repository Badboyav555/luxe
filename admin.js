// Admin Panel Management Engine Controller
async function toggleAdminPanel(sectionName, elementContext) {
    if(elementContext) {
        document.querySelectorAll('.admin-sidebar nav a').forEach(el => el.classList.remove('active'));
        elementContext.classList.add('active');
    }

    const workspace = document.getElementById('adminMainWorkspace');
    workspace.innerHTML = `<p>Compiling real-time data metrics analytics streams...</p>`;

    if(sectionName === 'analytics') {
        const { data: orders } = await _supabase.from('orders').select('*');
        let revenue = 0, pending = 0, delivered = 0;
        if(orders) {
            orders.forEach(o => {
                if(o.order_status === 'Delivered') revenue += o.total_amount;
                if(o.order_status !== 'Delivered' && o.order_status !== 'Cancelled') pending++;
                if(o.order_status === 'Delivered') delivered++;
            });
        }

        workspace.innerHTML = `
            <h2>System Global Operational Metrics</h2>
            <div class="grid-container" style="padding:0; margin-top:20px;">
                <div class="admin-card-metric"><h3>₹${revenue.toFixed(2)}</h3><p>Total Realized Revenue</p></div>
                <div class="admin-card-metric"><h3>${orders?orders.length:0}</h3><p>Gross Orders Logged</p></div>
                <div class="admin-card-metric"><h3>${pending}</h3><p>Active Pending Deliveries</p></div>
                <div class="admin-card-metric"><h3>${delivered}</h3><p>Successful Deliveries</p></div>
            </div>
        `;
    }

    else if(sectionName === 'products') {
        const { data: prods } = await _supabase.from('products').select('*');
        let tableRows = prods.map(p => `
            <tr>
                <td><img src="${p.images[0]}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>₹${p.discounted_price}</td>
                <td>${p.stock_quantity} units</td>
                <td><button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="deleteProductDataRecord('${p.id}')">Purge</button></td>
            </tr>
        `).join('');

        workspace.innerHTML = `
            <div style="display:flex; justify-content:between; align-items:center; margin-bottom:20px;">
                <h2>Product Lifecycle Management</h2>
                <button class="btn-primary" onclick="displayCreateProductModalForm()">Provision New Product</button>
            </div>
            <table class="admin-table">
                <thead><tr><th>Image</th><th>Design Name</th><th>Category</th><th>Price</th><th>Stock Status</th><th>Action</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
        `;
    }

    else if(sectionName === 'orders') {
        const { data: orders } = await _supabase.from('orders').select('*').order('created_at',{ascending:false});
        let tableRows = orders.map(o => `
            <tr>
                <td>${o.customer_name}<br><small style="color:var(--text-muted);">${o.customer_phone}</small></td>
                <td>${o.address_house}, ${o.city}, ${o.pincode}</td>
                <td>₹${o.total_amount}</td>
                <td><strong>${o.order_status}</strong></td>
                <td>
                    <select onchange="updateOrderStatusPivot('${o.id}', this.value)" style="background:var(--bg-main); color:white; padding:5px; border-radius:4px;">
                        <option value="">Update Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </td>
            </tr>
        `).join('');

        workspace.innerHTML = `
            <h2>Fulfillment & Tracking Control Hub Matrix</h2>
            <table class="admin-table">
                <thead><tr><th>Client Account</th><th>Detailed Dispatch Address Target</th><th>Order Total</th><th>Status</th><th>Override State Command</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
        `;
    }
}

async function updateOrderStatusPivot(orderId, nextStatus) {
    if(!nextStatus) return;
    
    // Fetch order state details to secure financial accounting criteria data loops
    const { data: order } = await _supabase.from('orders').select('*').eq('id', orderId).single();
    if(!order) return;

    const { error } = await _supabase.from('orders').update({ order_status: nextStatus }).eq('id', orderId);
    if(error) { showToast('Execution failure.'); return; }
    
    // Commission distribution loop: Trigger payouts when orders are delivered
    if(nextStatus === 'Delivered' && order.referrer_id && !order.commission_processed) {
        // Flag order commission logic processed state updates tracking values records parameters 
        await _supabase.from('orders').update({ commission_processed: true }).eq('id', orderId);
        showToast(`Commission attribution finalized for Account Ref ID: ${order.referrer_id}`);
    }

    showToast(`Order updated to status: ${nextStatus}`);
    toggleAdminPanel('orders');
}

async function deleteProductDataRecord(id) {
    if(confirm("Confirm asset deletion?")) {
        await _supabase.from('products').delete().eq('id', id);
        showToast('Inventory entry wiped out');
        toggleAdminPanel('products');
    }
}

function displayCreateProductModalForm() {
    const workspace = document.getElementById('adminMainWorkspace');
    workspace.innerHTML = `
        <h2>Provision New Inventory Asset Stock</h2>
        <form id="newProductForm" onsubmit="processNewProductUploadSubmission(event)" style="margin-top:20px; display:grid; gap:15px; max-width:600px;">
            <input type="text" id="admName" placeholder="Product Design Title" required style="padding:12px; background:var(--bg-card); color:white; border:1px solid var(--glass-border); border-radius:8px;">
            <textarea id="admDesc" placeholder="Product Description Dossier Copy" required style="padding:12px; background:var(--bg-card); color:white; border:1px solid var(--glass-border); border-radius:8px; height:100px;"></textarea>
            <input type="text" id="admCat" placeholder="Category (e.g. Sarees, Kurti, Luxury Dresses)" required style="padding:12px; background:var(--bg-card); color:white; border:1px solid var(--glass-border); border-radius:8px;">
            
            <div style="display:flex; gap:10px;">
                <input type="number" id="admOrigPrice" placeholder="Original Price" required style="flex:1; padding:12px; background:var(--bg-card); color:white; border:1px solid var(--glass-border); border-radius:8px;">
                <input type="number" id="admDiscPrice" placeholder="Discounted Listing Price" required style="flex:1; padding:12px; background:var(--bg-card); color:white; border:1px solid var(--glass-border); border-radius:8px;">
            </div>
            
            <input type="text" id="admSizes" placeholder="Comma Separated Sizes Available (e.g. S, M, L, XL, FreeSize)" required style="padding:12px; background:var(--bg-card); color:white; border:1px solid var(--glass-border); border-radius:8px;">
            <input type="number" id="admStock" placeholder="Initial Inventory Units Count Quantity" required style="padding:12px; background:var(--bg-card); color:white; border:1px solid var(--glass-border); border-radius:8px;">
            
            <div style="border:2px dashed var(--glass-border); padding:20px; text-align:center; border-radius:8px; background:var(--bg-secondary);">
                <p style="margin-bottom:10px; color:var(--text-muted);">Select Product Asset Media (Multiple Images URL Link Injection Method Grid)</p>
                <input type="text" id="admImgUrls" placeholder="Paste image asset URLs separated by commas" required style="width:100%; padding:12px; background:var(--bg-main); color:white; border:1px solid var(--glass-border); border-radius:8px;">
            </div>

            <button type="submit" class="btn-primary">Commit To Global Inventory Catalog</button>
            <button type="button" class="btn-secondary" onclick="toggleAdminPanel('products')">Abort Operations</button>
        </form>
    `;
}

async function processNewProductUploadSubmission(e) {
    e.preventDefault();
    const orig = parseFloat(document.getElementById('admOrigPrice').value);
    const disc = parseFloat(document.getElementById('admDiscPrice').value);
    const calcPct = Math.round(((orig - disc) / orig) * 100);

    const payload = {
        name: document.getElementById('admName').value,
        description: document.getElementById('admDesc').value,
        category: document.getElementById('admCat').value,
        original_price: orig,
        discounted_price: disc,
        discount_percentage: calcPct,
        sizes: document.getElementById('admSizes').value.split(',').map(s => s.trim()),
        stock_quantity: parseInt(document.getElementById('admStock').value),
        images: document.getElementById('admImgUrls').value.split(',').map(u => u.trim()),
        cod_available: true
    };

    const { error } = await _supabase.from('products').insert([payload]);
    if(error) { showToast(`Database insertion failed: ${error.message}`); }
    else {
        showToast('Inventory line item compiled successfully!');
        toggleAdminPanel('products');
    }
}

// Automatically mount default view dashboard upon structural interface boot up loop initialization parameters
window.onload = () => toggleAdminPanel('analytics');
