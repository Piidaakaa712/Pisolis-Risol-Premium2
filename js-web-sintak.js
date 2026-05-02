document.addEventListener('DOMContentLoaded', function () {
 
  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
 
  /* ---- Order page logic (only runs if order elements exist) ---- */
  var orderItemsList = document.getElementById('order-items-list');
  if (!orderItemsList) return;
 
  var subtotalEl   = document.getElementById('subtotal-val');
  var discountRow  = document.getElementById('discount-row');
  var discountEl   = document.getElementById('discount-val');
  var totalEl      = document.getElementById('total-val');
  var promoInput   = document.getElementById('promoInput');
  var applyBtn     = document.getElementById('applyPromo');
  var promoMsg     = document.getElementById('promo-msg');
  var btnOrder     = document.getElementById('btnOrder');
 
  var PROMO_CODE   = 'F1R5TBIT3S20';
  var DISCOUNT_PCT = 0.20;
  var promoApplied = false;
 
  /* -- Order state object -- */
  var orderState = {};
 
  /* -- Format currency -- */
  function formatRp(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
  }
 
  /* -- Build totals -- */
  function calcTotals() {
    var subtotal = 0;
    Object.values(orderState).forEach(function (item) {
      subtotal += item.price * item.qty;
    });
    var discount = promoApplied ? Math.round(subtotal * DISCOUNT_PCT) : 0;
    var total    = subtotal - discount;
 
    subtotalEl.textContent = formatRp(subtotal);
    totalEl.textContent    = formatRp(total);
 
    if (discount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent    = '- ' + formatRp(discount);
    } else {
      discountRow.style.display = 'none';
    }
  }
 
  /* -- Render order list -- */
  function renderOrderList() {
    if (Object.keys(orderState).length === 0) {
      orderItemsList.innerHTML = '<p class="text-muted small empty-cart-msg text-center py-3">Belum ada item dipilih.</p>';
      calcTotals();
      return;
    }
 
    var html = '';
    Object.values(orderState).forEach(function (item) {
      if (item.qty > 0) {
        html += '<div class="order-items-row d-flex justify-content-between align-items-center mb-2">' +
          '<span class="me-2" style="font-size:13px">' + item.name + ' <span class="text-muted">x' + item.qty + '</span></span>' +
          '<span style="font-size:13px;font-weight:600">' + formatRp(item.price * item.qty) + '</span>' +
        '</div>';
      }
    });
    if (!html) {
      orderItemsList.innerHTML = '<p class="text-muted small empty-cart-msg text-center py-3">Belum ada item dipilih.</p>';
    } else {
      orderItemsList.innerHTML = html;
    }
    calcTotals();
  }
 
  /* -- Quantity controls -- */
  document.querySelectorAll('.order-menu-card').forEach(function (card) {
    var name  = card.dataset.name;
    var price = parseInt(card.dataset.price, 10);
    var qtyEl = card.querySelector('.qty-num');
    var minusBtn = card.querySelector('.btn-minus');
    var plusBtn  = card.querySelector('.btn-plus');
 
    orderState[name] = { name: name, price: price, qty: 0 };
 
    plusBtn.addEventListener('click', function () {
      orderState[name].qty++;
      qtyEl.textContent = orderState[name].qty;
      renderOrderList();
    });
 
    minusBtn.addEventListener('click', function () {
      if (orderState[name].qty > 0) {
        orderState[name].qty--;
        qtyEl.textContent = orderState[name].qty;
        renderOrderList();
      }
    });
  });
 
  /* -- Category Tabs -- */
  document.querySelectorAll('[data-category]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var cat = this.dataset.category;
 
      document.querySelectorAll('[data-category]').forEach(function (t) {
        t.classList.remove('active');
      });
      this.classList.add('active');
 
      document.querySelectorAll('.order-category').forEach(function (el) {
        el.classList.add('d-none');
      });
 
      var target = document.getElementById('cat-' + cat);
      if (target) target.classList.remove('d-none');
    });
  });
 
  /* -- Promo Code -- */
  if (applyBtn) {
    applyBtn.addEventListener('click', function () {
      var code = promoInput ? promoInput.value.trim().toUpperCase() : '';
      if (code === PROMO_CODE) {
        promoApplied = true;
        promoMsg.innerHTML = '<span class="text-success fw-semibold">✅ Promo berhasil dipakai! Diskon 20%</span>';
        promoInput.disabled = true;
        applyBtn.disabled   = true;
      } else {
        promoApplied = false;
        promoMsg.innerHTML = '<span class="text-danger">❌ Kode promo tidak valid.</span>';
      }
      calcTotals();
    });
  }
 
  /* -- WhatsApp Order -- */
  if (btnOrder) {
    btnOrder.addEventListener('click', function () {
      var name    = document.getElementById('custName')    ? document.getElementById('custName').value.trim()    : '';
      var phone   = document.getElementById('custPhone')   ? document.getElementById('custPhone').value.trim()   : '';
      var address = document.getElementById('custAddress') ? document.getElementById('custAddress').value.trim() : '';
      var note    = document.getElementById('custNote')    ? document.getElementById('custNote').value.trim()    : '';
 
      if (!name || !phone || !address) {
        alert('Mohon lengkapi Nama, Nomor WA, dan Alamat Pengiriman ya 😊');
        return;
      }
 
      var hasItem = Object.values(orderState).some(function (i) { return i.qty > 0; });
      if (!hasItem) {
        alert('Pilih minimal 1 menu dulu ya! 🍱');
        return;
      }
 
      var subtotal = 0;
      var itemLines = '';
      Object.values(orderState).forEach(function (item) {
        if (item.qty > 0) {
          itemLines += '%0A- ' + item.name + ' x' + item.qty + ' = ' + formatRp(item.price * item.qty);
          subtotal += item.price * item.qty;
        }
      });
 
      var discount = promoApplied ? Math.round(subtotal * DISCOUNT_PCT) : 0;
      var total    = subtotal - discount;
 
      var msg = 'Halo Pisolis Premium! Saya ingin memesan:%0A' +
        itemLines + '%0A%0A' +
        '*Subtotal:* ' + formatRp(subtotal) + '%0A' +
        (discount > 0 ? '*Diskon 20%:* - ' + formatRp(discount) + '%0A' : '') +
        '*Total:* ' + formatRp(total) + '%0A%0A' +
        '*Nama:* ' + encodeURIComponent(name) + '%0A' +
        '*Alamat:* ' + encodeURIComponent(address) + '%0A' +
        (note ? '*Catatan:* ' + encodeURIComponent(note) + '%0A' : '') +
        '%0ATerima kasih! 🙏';
 
      var waNumber = '62089604381528';
      var waUrl    = 'https://wa.me/' + waNumber + '?text=' + msg;
      window.open(waUrl, '_blank');
 
      /* Show success modal */
      var modalEl = document.getElementById('successModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        var modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    });
  }
 
  /* -- Navbar scroll effect -- */
  window.addEventListener('scroll', function () {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
      navbar.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
    }
  });
 
});

