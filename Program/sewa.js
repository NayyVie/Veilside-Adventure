/* Veilside Gear — sewa.js (Grid + Guest Cart + Diskon Kamis + Panel Keranjang) */
(function () {
  'use strict';

  // kalau folder Produk DI LUAR folder web:
  var IMG_BASE = '../Produk/';
  // kalau nanti folder Produk ada di dalam, ubah ke: var IMG_BASE = 'Produk/';

  var CART_KEY = 'vs_cart';
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); };

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  // hitung total + DISKON KAMIS (day=4) → dipakai di form & success
  function calcTotals(items, days) {
    var subtotalPerDay = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    var subtotal = subtotalPerDay * days;
    var isThursday = (new Date().getDay() === 4);
    var discount = isThursday ? subtotal * 0.10 : 0;
    var total = subtotal - discount;
    return { subtotalPerDay: subtotalPerDay, subtotal: subtotal, discount: discount, total: total };
  }

  // daftar produk
  var products = [
    { name: "Tenda Dome 2-3 Orang", price: 50000, desc: "Tenda ringan & tahan angin"},
    { name: "Kompor Portable",      price: 25000, desc: "Ringkas untuk camping/hiking"},
    { name: "Sleeping Bag",         price: 20000, desc: "Hangat dan nyaman" },
    { name: "Lampu Camping",        price: 15000, desc: "LED tahan lama" },
    { name: "Matras Gulung",        price: 10000, desc: "Anti air, mudah dibawa" },
    { name: "Kursi Lipat",          price: 20000, desc: "Praktis untuk santai" },
    { name: "Meja Lipat",           price: 30000, desc: "Ringan & stabil" },
    { name: "Carrier 60L",          price: 40000, desc: "Kapasitas besar, anti air" },
    { name: "Nesting Set",          price: 20000, desc: "Panci, wajan, sendok" },
    { name: "Kompas",               price: 5000,  desc: "Navigasi analog" },
    { name: "Jas Hujan",            price: 10000, desc: "Siaga cuaca ekstrem" },
    { name: "Trekking Pole",        price: 15000, desc: "Anti-slip, adjustable" },
    { name: "Headlamp",             price: 10000, desc: "3 mode pencahayaan" },
    { name: "Gas Kaleng",           price: 10000, desc: "Bahan bakar kompor" },
    { name: "Cooler Box",           price: 25000, desc: "Jaga dingin makanan/minum" },
    { name: "Water Jug 10L",        price: 15000, desc: "Kapasitas besar, lipat" },
    { name: "Cooking Set Jumbo",    price: 30000, desc: "Untuk 4–6 orang" },
    { name: "Flysheet 3x4m",        price: 20000, desc: "Lindungi dari hujan/panas" },
    { name: "Kabel Tenda & Pasak",  price: 5000,  desc: "Tambahan tali & pasak" },
    { name: "Senter Taktikal",      price: 15000, desc: "Fokus jauh, rechargeable" },
    { name: "Powerbank 20000mAh",   price: 25000, desc: "Cadangan daya lama" },
    { name: "Sepatu Hiking",        price: 40000, desc: "Anti slip, tangguh" },
    { name: "Topi Outdoor",         price: 8000,  desc: "Lindungi dari UV" },
    { name: "Kacamata Polarized",   price: 10000, desc: "Redam silau & debu" },
    { name: "Rompi Pelampung",      price: 20000, desc: "Aktivitas air aman" }
  ];

  /* ========== HALAMAN: sewa.html ========== */

  function renderProducts() {
    var container = $('product-list');
    if (!container) return;

    container.innerHTML = products.map(function (p, i) {
      var imgTag = p.img
        ? '<img src="'+ p.img +'" alt="'+ p.name +'" class="product-img" loading="lazy" onerror="this.onerror=null;this.src=\''+ IMG_BASE +'placeholder.png\'">'
        : '';
      return '' +
        '<div class="card">' +
          imgTag +
          '<h3>'+ p.name +'</h3>' +
          '<p>'+ (p.desc || '') +'</p>' +
          '<p><strong>'+ fmt(p.price) +'/hari</strong></p>' +
          '<button class="btn-primary" data-add="'+ i +'">Tambah ke Keranjang</button>' +
        '</div>';
    }).join('');

    // listener tambah
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-add]');
      if (!btn) return;
      var idx = Number(btn.getAttribute('data-add'));
      addToCart(products[idx]);
      // feedback tombol
      var old = btn.textContent;
      btn.textContent = 'Ditambahkan ✓';
      setTimeout(function(){ btn.textContent = old; }, 900);
    });

    // render panel awal (supaya angka keranjang langsung sesuai)
    renderCartPanel();
  }

  // tambahkan item ke keranjang
  function addToCart(product) {
    var cart = loadCart();
    var found = cart.find(function (c) { return c.name === product.name; });
    if (found) {
      found.qty += 1;
    } else {
      cart.push({ name: product.name, price: product.price, qty: 1 });
    }
    saveCart(cart);
    renderCartPanel();
  }

  // render panel keranjang (sewa.html)
  function renderCartPanel() {
    var cart = loadCart();
    var listEl = $('cart-items');
    var totalEl = $('cart-total');
    var countEl = $('cart-count');

    if (countEl) countEl.textContent = cart.reduce(function (s, i){ return s + i.qty; }, 0);

    if (!listEl) return;

    if (!cart.length) {
      listEl.innerHTML = '<p>Keranjang kosong.</p>';
      if (totalEl) totalEl.textContent = 'Rp 0';
      return;
    }

    var subtotalPerDay = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);

    listEl.innerHTML = cart.map(function (item, idx) {
      return '' +
        '<div class="cart-item" data-idx="'+ idx +'">' +
          '<div class="ci-name">'+ item.name +'</div>' +
          '<div class="ci-controls">' +
            '<button type="button" class="ci-btn" data-action="dec">-</button>' +
            '<span class="ci-qty">'+ item.qty +'</span>' +
            '<button type="button" class="ci-btn" data-action="inc">+</button>' +
            '<span class="ci-price">'+ fmt(item.price) +'</span>' +
            '<button type="button" class="ci-remove" data-action="remove">🗑</button>' +
          '</div>' +
        '</div>';
    }).join('');

    if (totalEl) totalEl.textContent = fmt(subtotalPerDay);
  }

  // init tombol show/hide panel
  function initCartPanelToggle() {
    var toggle = $('cart-toggle');
    var closeBtn = $('cart-close');
    var panel = $('cart-panel');
    var backdrop = $('cart-backdrop');

    if (!panel) return;

    function openPanel() {
      panel.classList.add('open');
      if (backdrop) backdrop.classList.add('show');
    }
    function closePanel() {
      panel.classList.remove('open');
      if (backdrop) backdrop.classList.remove('show');
    }

    if (toggle) toggle.addEventListener('click', openPanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    if (backdrop) backdrop.addEventListener('click', closePanel);

    // event untuk inc/dec/remove
    var listEl = $('cart-items');
    if (listEl) {
      listEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        var action = btn.getAttribute('data-action');
        var wrap = btn.closest('[data-idx]');
        if (!wrap) return;
        var idx = Number(wrap.getAttribute('data-idx'));
        var cart = loadCart();
        var item = cart[idx];
        if (!item) return;

        if (action === 'inc') {
          item.qty += 1;
        } else if (action === 'dec') {
          item.qty -= 1;
          if (item.qty <= 0) {
            cart.splice(idx, 1);
          }
        } else if (action === 'remove') {
          cart.splice(idx, 1);
        }

        saveCart(cart);
        renderCartPanel();
      });
    }
  }

  /* ========== HALAMAN: form.html ========== */
  function renderCartSummary() {
    var box = $('cart-summary');
    var daysInput = $('days');
    if (!box || !daysInput) return;

    var cart = loadCart();
    var days = Math.max(1, parseInt(daysInput.value || '1', 10));

    if (!cart.length) {
      box.innerHTML = '<div class="card"><p>Keranjang masih kosong. Silakan pilih barang di <a href="sewa.html">Daftar Produk</a>.</p></div>';
      window.__VS_TMP_TOTALS__ = { items: [], days, subtotalPerDay: 0, subtotal: 0, discount: 0, total: 0 };
      return;
    }

    var totals = calcTotals(cart, days);
    var rows = cart.map(function (i, idx) {
      return '<tr>' +
        '<td>' + (idx + 1) + '</td>' +
        '<td>' + i.name + '</td>' +
        '<td style="text-align:right">' + i.qty + 'x</td>' +
        '<td style="text-align:right">' + fmt(i.price) + '</td>' +
      '</tr>';
    }).join('');

    box.innerHTML =
      '<div class="card" style="overflow:auto">' +
        '<h3>Keranjang Penyewaan</h3>' +
        '<table style="width:100%;border-collapse:collapse;margin-top:8px">' +
          '<thead><tr><th>#</th><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Harga/Hari</th></tr></thead>' +
          '<tbody>'+ rows +'</tbody>' +
        '</table>' +
        '<hr style="margin:14px 0">' +
        '<p>Subtotal per hari: <strong>'+ fmt(totals.subtotalPerDay) +'</strong></p>' +
        '<p>Lama sewa: <strong>'+ days +'</strong> hari</p>' +
        '<p>Subtotal: <strong>'+ fmt(totals.subtotal) +'</strong></p>' +
        '<p>Diskon (otomatis Kamis): <strong>'+ fmt(totals.discount) +'</strong></p>' +
        '<h3>Total: '+ fmt(totals.total) +'</h3>' +
      '</div>';

    window.__VS_TMP_TOTALS__ = {
      items: cart,
      days: days,
      subtotalPerDay: totals.subtotalPerDay,
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total
    };
  }

  function initFormPage() {
    var form = $('rental-form');
    var daysInput = $('days');
    var paymentSelect = $('payment');
    var qrSection = $('qr-section');
    if (!form) return;

    if (paymentSelect && qrSection) {
      paymentSelect.addEventListener('change', function () {
        qrSection.style.display = paymentSelect.value === 'qris' ? 'block' : 'none';
      });
    }

    renderCartSummary();
    if (daysInput) daysInput.addEventListener('input', renderCartSummary);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = $('name').value.trim();
      var wa = $('wa').value.trim();
      var start = $('start').value;
      var days = Math.max(1, parseInt(($('days').value || '1'), 10));
      var payment = ($('payment').value || '').trim();

      if (!payment) { alert('Pilih metode pembayaran terlebih dahulu!'); return; }
      if (!/^08\d{8,12}$/.test(wa)) { alert('Nomor WhatsApp tidak valid!'); return; }

      var cart = loadCart();
      if (!cart.length) { alert('Keranjang kosong. Pilih barang di halaman daftar.'); return; }

      var totals = calcTotals(cart, days);

      var transaksi = {
        name: name,
        wa: wa,
        start: start,
        days: days,
        payment: payment,
        items: cart,
        totals: {
          subtotalPerDay: totals.subtotalPerDay,
          subtotal: totals.subtotal,
          discount: totals.discount,
          total: totals.total
        }
      };

      // kosongkan keranjang setelah submit
      saveCart([]);

      sessionStorage.setItem('vs_lastOrder', JSON.stringify(transaksi));
      window.location.href = 'success.html';
    });
  }

  /* ========== BOOT ========== */
  function boot() {
    var page = (location.pathname.split('/').pop() || '').toLowerCase();
    if (page === 'sewa.html') {
      renderProducts();
      initCartPanelToggle();
    }
    if (page === 'form.html') {
      initFormPage();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
