console.log('script.js loaded');

const products = [
  {id:1,  title:'Áo thun Basic',       category:'ao',      price:250000, img:'image/aothun.webp', featured:true},
  {id:2,  title:'Quần jean',           category:'quan',    price:450000, img:'image/quanjean.webp'},
  {id:3,  title:'Hoodie ấm',           category:'aokhoac', price:500000, img:'image/aohoodie2.webp', featured:true},
  {id:4,  title:'Váy xòe',             category:'vay',     price:400000, img:'image/vayxoe.jpg'},
  {id:5,  title:'Áo sơ mi',            category:'ao',      price:300000, img:'image/aosomi.webp'},
  {id:11, title:'Nón Baseball Cap Kaki',       category:'phukien', price:90000, img:'image/nonkaki.webp'},
  {id:12, title:'Ví Ngang Công Sở',  category:'phukien', price:280000, img:'image/vicongso.webp'},
  {id:13, title:'Balo Rokin Aston',            category:'phukien', price:400000, img:'image/balo-laptop-rokin-aston-11.webp'},
  {id:14, title:'Balo máy ảnh K&F',            category:'phukien', price:1300000, img:'image/balomayanh.avif', featured:true},
  {id:15, title:'Giày Thể Thao Nam',            category:'giay', price:350000, img:'image/giaynam.jpg'},
  {id:16, title:'Giày Sandal Nữ',            category:'giay', price:230000, img:'image/giaynu.jpg'},
];

console.log('products count =', products.length);

function formatVND(n){ return n.toLocaleString('vi-VN') + 'đ' }

function getCart(){ return JSON.parse(localStorage.getItem('fs_cart')||'[]') }
function saveCart(c){ localStorage.setItem('fs_cart', JSON.stringify(c)) }
function updateCartCountUI(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = count);
}

function loginUser(email, password){
  const users = JSON.parse(localStorage.getItem('fs_users') || '[]');

  // Tài khoản demo mặc định
  if(email === 'demo@fashionstore.vn' && password === '123456'){
    const user = {
      email: email,
      name: 'Demo User',
      role: 'customer'
    };

    localStorage.setItem('fs_user', JSON.stringify(user));
    return true;
  }

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if(user){
    localStorage.setItem('fs_user', JSON.stringify({
      email: user.email,
      name: user.name,
      role: user.role
    }));
    return true;
  }

  return false;
}

function getUser(){
  return JSON.parse(localStorage.getItem('fs_user')||'null');
}

function updateAuthUI(){
  const user = getUser();
  const authLink = document.getElementById('auth-link');
  if(!authLink) return;
  if(user){
    authLink.textContent = `Xin chào, ${user.name}`;
    authLink.href = 'account.html';
  } else {
    authLink.textContent = 'Đăng nhập';
    authLink.href = 'login.html';
  }
}

const categoryGroups = {
  clothes: ['ao', 'quan', 'vay', 'aokhoac'],
  accessories: ['phukien', 'giay']
};

function renderProducts(selector, options = {}){
  const root = document.querySelector(selector);
  if(!root){
    console.warn('renderProducts: selector not found ->', selector);
    return 0;
  }
  let list = products.slice();

  if(options.featured) list = list.filter(p => p.featured);
  if(options.search){
    const keyword = options.search.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(keyword));
  }
  if(options.category && options.category !== 'all'){
    const cat = options.category;
    if(Array.isArray(cat)){
      list = list.filter(p => cat.includes(p.category));
    } else if(categoryGroups[cat]){
      list = list.filter(p => categoryGroups[cat].includes(p.category));
    } else {
      list = list.filter(p => p.category === cat);
    }
  }
  if(options.limit) list = list.slice(0, options.limit);

  console.log('renderProducts -> selector:', selector, 'category:', options.category || 'all', 'search:', options.search || '', 'items:', list.length);

  if(list.length === 0){
    root.innerHTML = '<div class="empty-result">Không tìm thấy sản phẩm nào.</div>';
    return 0;
  }

  root.innerHTML = list.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${p.title}" onerror="this.onerror=null;this.src='images/placeholder.jpg'">
      <h3>${p.title}</h3>
      <p class="price">${formatVND(p.price)}</p>
      <div>
        <a class="btn" href="product-detail.html?id=${p.id}">Chi tiết</a>
        <button class="btn" onclick="addToCart(${p.id},1)" style="margin-left:8px">Thêm giỏ</button>
      </div>
    </div>
  `).join('');
  return list.length;
}

function renderProductDetail(id, selector){
  const p = products.find(x=>String(x.id)===String(id));
  const root = document.querySelector(selector);
  if(!root) return;
  if(!p){ root.innerHTML = '<p>Không tìm thấy sản phẩm</p>'; return; }

  const showSize = (p.category !== 'phukien');

  root.innerHTML = `
    <div style="display:flex;gap:24px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px">
        <img src="${p.img}" alt="${p.title}" style="width:100%;border-radius:8px" onerror="this.onerror=null;this.src='images/placeholder.jpg'">
      </div>
      <div style="flex:1;min-width:260px">
        <h2>${p.title}</h2>
        <p class="price">${formatVND(p.price)}</p>

        ${ p.category === 'giay' ? `
<div>
  <label>Size:
    <select id="size-select">
      <option>38</option>
      <option>39</option>
      <option>40</option>
      <option>41</option>
    </select>
  </label>
</div>
` : p.category === 'phukien' ? `
<div style="margin-top:12px">
  <label>Màu sắc:</label>

  <div style="display:flex;gap:12px;margin-top:10px">

    <button type="button"
      onclick="selectColor(this, 'Đen')"
      style="width:36px;height:36px;border-radius:50%;background:#111;border:3px solid #fff;box-shadow:0 0 0 1px #ccc;cursor:pointer"
      title="Đen">
    </button>

    <button type="button"
      onclick="selectColor(this, 'Trắng')"
      style="width:36px;height:36px;border-radius:50%;background:#fff;border:3px solid #fff;box-shadow:0 0 0 1px #ccc;cursor:pointer"
      title="Trắng">
    </button>

    <button type="button"
      onclick="selectColor(this, 'Nâu')"
      style="width:36px;height:36px;border-radius:50%;background:#8b4513;border:3px solid #fff;box-shadow:0 0 0 1px #ccc;cursor:pointer"
      title="Nâu">
    </button>

    <button type="button"
      onclick="selectColor(this, 'Xanh')"
      style="width:36px;height:36px;border-radius:50%;background:#1e3a8a;border:3px solid #fff;box-shadow:0 0 0 1px #ccc;cursor:pointer"
      title="Xanh">
    </button>

  </div>

  <input type="hidden" id="color-select" value="">
</div>
` : `
<div>
  <label>Size:
    <select id="size-select">
      <option>S</option>
      <option>M</option>
      <option>L</option>
      <option>XL</option>
    </select>
  </label>
</div>
` }

        <div style="margin-top:12px">
          Số lượng:
          <button onclick="changeQtyInput(-1)">-</button>
          <input id="qty-input" value="1" style="width:40px;text-align:center"/>
          <button onclick="changeQtyInput(1)">+</button>
        </div>

        <div style="margin-top:12px">
          <button class="btn" onclick="addCurrentProductToCart(${p.id})">THÊM VÀO GIỎ</button>
        </div>
      </div>
    </div>
  `;
}

function selectColor(button, color){
  document.querySelectorAll('[onclick^="selectColor"]').forEach(btn => {
    btn.style.outline = 'none';
  });
  button.style.outline = '3px solid #ff6b6b';
  button.style.outlineOffset = '2px';
  const input = document.getElementById('color-select');
  if(input) input.value = color;
}

function addCurrentProductToCart(productId){
  const p = products.find(x => x.id === productId);
  if(!p) return;
  const qtyInput = document.getElementById('qty-input');
  const qty = parseInt(qtyInput?.value || 1);
  let variant = {};
  if(p.category === 'giay'){
    const size = document.getElementById('size-select')?.value;
    variant.size = size;
  } else if(['ao', 'quan', 'vay', 'aokhoac'].includes(p.category)){
    const size = document.getElementById('size-select')?.value;
    variant.size = size;
  } else if(p.category === 'phukien'){
    const color = document.getElementById('color-select')?.value;
    if(!color){
      alert('Vui lòng chọn màu');
      return;
    }
    variant.color = color;
  }
  addToCart(productId, qty, variant);
}

function changeQtyInput(delta){
  const inp = document.getElementById('qty-input');
  if(!inp) return;
  let v = parseInt(inp.value||'1') + delta;
  if(isNaN(v) || v<1) v = 1;
  inp.value = v;
}

function addToCart(productId, qty=1, variant={}){
  const p = products.find(x => x.id === productId);
  if(!p){
    alert('Sản phẩm không tồn tại');
    return;
  }
  const cart = getCart();
  const idx = cart.findIndex(item =>
    item.id === productId &&
    item.variant?.size === variant.size &&
    item.variant?.color === variant.color
  );
  if(idx >= 0){
    cart[idx].qty += qty;
  } else {
    cart.push({id: productId, qty: qty, variant: variant});
  }
  saveCart(cart);
  updateCartCountUI();
  alert('Đã thêm vào giỏ');
}

function renderCart(selector){
  const root = document.querySelector(selector);
  if(!root) return;
  const cart = getCart();
  if(cart.length === 0){
    root.innerHTML = '<p>Giỏ hàng rỗng.</p>';
    return;
  }
  let html = '<div class="cart-list">';
  let total = 0;

  cart.forEach((item, index) => {
    const p = products.find(x => x.id === item.id);
    if(!p) return;
    const sub = p.price * item.qty;
    total += sub;
    let variantText = '';
    if(item.variant?.size){ variantText += `<p>Size: ${item.variant.size}</p>`; }
    if(item.variant?.color){ variantText += `<p>Màu: ${item.variant.color}</p>`; }
    html += `
      <div class="card" style="display:flex;gap:12px;align-items:center">
        <img src="${p.img}" alt="${p.title}" style="width:120px;height:80px;object-fit:cover" onerror="this.onerror=null;this.src='images/placeholder.jpg'" />
        <div style="flex:1">
          <h3>${p.title}</h3>
          ${variantText}
          <p>
            ${formatVND(p.price)} ×
            <button onclick="updateCartQty(${index}, ${item.qty - 1})">-</button>
            ${item.qty}
            <button onclick="updateCartQty(${index}, ${item.qty + 1})">+</button>
          </p>
        </div>
        <div style="text-align:right">
          <p>${formatVND(sub)}</p>
          <p><button onclick="removeFromCart(${index})">Xóa</button></p>
        </div>
      </div>
    `;
  });
  html += `</div><div style="margin-top:16px"><h3>Tổng: ${formatVND(total)}</h3><button class="btn" onclick="checkout()">Thanh toán</button></div>`;
  root.innerHTML = html;
}

function updateCartQty(index, qty){
  const cart = getCart();
  if(index < 0 || index >= cart.length) return;
  if(qty <= 0){ cart.splice(index, 1);
  } else { cart[index].qty = qty; }
  saveCart(cart);
  if(document.querySelector('#cart-root')){ renderCart('#cart-root'); }
  updateCartCountUI();
}

function removeFromCart(index){
  const cart = getCart();
  if(index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveCart(cart);
  if(document.querySelector('#cart-root')){ renderCart('#cart-root'); }
  updateCartCountUI();
}

function checkout(){
  alert('Đây là demo — chưa có thanh toán thật. Cảm ơn bạn!');
  localStorage.removeItem('fs_cart');
  if(document.querySelector('#cart-root')) renderCart('#cart-root');
  updateCartCountUI();
}

function countByCategory(cat){
  if(!cat || cat === 'all') return products.length;
  if(Array.isArray(cat)) return products.filter(p => cat.includes(p.category)).length;
  if(categoryGroups[cat]) return products.filter(p => categoryGroups[cat].includes(p.category)).length;
  return products.filter(p => p.category === cat).length;
}
