function loadcarttotal() {
    const cart = JSON.parse(localStorage.getItem('gv_cart') || '[]');

    if (cart.length > 0) {
        const subtotal = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);

        const discountCode = sessionStorage.getItem('gv_discount_code') || '';
        const DISCOUNTS = { 'SAVE10': 0.10, 'GAMER20': 0.20 };
        const rate = DISCOUNTS[discountCode.toUpperCase()] || 0;
        const discountAmt = subtotal * rate;
        const total = subtotal - discountAmt;

        document.getElementById('co-subtotal').textContent = '$' + subtotal.toFixed(2);
        document.getElementById('co-discount').textContent = discountAmt > 0 ? '-$' + discountAmt.toFixed(2) : '$00.00';
        document.getElementById('co-total').textContent = '$' + total.toFixed(2);
    }


    const badge = document.getElementById('nav-cart-badge');
    const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

let selectedMethod = 'visa';

function selectMethod(btn) {
    document.querySelectorAll('.pay-logo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedMethod = btn.dataset.method;

    const cardFields = document.getElementById('card-fields');
    const redirectMsg = document.getElementById('redirect-msg');

    if (selectedMethod === 'visa' || selectedMethod === 'mastercard') {
        cardFields.style.display = 'block';
        redirectMsg.style.display = 'none';
    } else {
        cardFields.style.display = 'none';
        redirectMsg.style.display = 'block';
    }


    document.querySelectorAll('.saved-method').forEach(m => m.classList.remove('active'));
}


let usingSaved = false;

function selectSaved(el) {
    document.querySelectorAll('.saved-method').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.pay-logo-btn').forEach(b => b.classList.remove('active'));
    usingSaved = true;

    document.getElementById('card-fields').style.display = 'none';
    document.getElementById('redirect-msg').style.display = 'none';
}


function formatCard(el) {
    let v = el.value.replace(/\D/g, '').slice(0, 16);
    el.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(el) {
    let v = el.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    el.value = v;
}


function validate() {

    if (usingSaved || (selectedMethod !== 'visa' && selectedMethod !== 'mastercard')) {
        return true;
    }

    let valid = true;

    const fields = [
        { id: 'card-name', errId: 'err-name', test: v => v.trim().length > 1, msg: 'Please enter the card holder name' },
        { id: 'card-number', errId: 'err-number', test: v => v.replace(/\s/g, '').length === 16, msg: 'Please enter a valid 16-digit card number' },
        { id: 'card-expiry', errId: 'err-expiry', test: v => /^\d{2}\/\d{2}$/.test(v), msg: 'Invalid expiry date (MM/YY)' },
        { id: 'card-cvv', errId: 'err-cvv', test: v => /^\d{3,4}$/.test(v), msg: 'CVV must be 3 or 4 digits' },
    ];

    fields.forEach(({ id, errId, test, msg }) => {
        const input = document.getElementById(id);
        const err = document.getElementById(errId);
        if (!test(input.value)) {
            input.classList.add('invalid');
            err.textContent = msg;
            err.classList.add('show');
            valid = false;
        } else {
            input.classList.remove('invalid');
            err.classList.remove('show');
        }
    });

    return valid;
}


['card-name', 'card-number', 'card-expiry', 'card-cvv'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', function () {
        this.classList.remove('invalid');
        const err = document.getElementById('err-' + id.replace('card-', ''));
        if (err) err.classList.remove('show');
    });
});


function confirm_payment() {
    if (!validate()) return;


    localStorage.removeItem('gv_cart');
    sessionStorage.removeItem('gv_discount_code');


    document.getElementById('success-overlay').classList.add('show');
}

window.addEventListener('storage', loadcarttotal);
loadcarttotal();
