var supabase_url = 'https://nwlvmxuchxvfbpuqbsab.supabase.co'
var supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bHZteHVjaHh2ZmJwdXFic2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTU2NDMsImV4cCI6MjA4Njg5MTY0M30.RswqeFtHpHbWF-SWG0Z5wNdf_1WmAvuncSmqccwwv4Q'

var discounts = { 'SAVE10': 0.10, 'GAMER20': 0.20 }


// loads the cart from supabase and shows it on the page
async function rendercart() {

    let container = document.getElementById('cart-items')
    let subtitle = document.getElementById('cart-subtitle')

    let user_id = null
    let userdata = localStorage.getItem("loggedInUser")
    if (userdata) {
        let user = JSON.parse(userdata)
        if (user.id) {
            user_id = user.id
        }
    }


    if (!user_id) {
        container.innerHTML = '<p style="color:rgba(255,255,255,.4);text-align:center;padding:3rem;">Please <a href="../login/Login.html" style="color:#5865f2;">login</a> to see your cart.</p>'
        subtitle.textContent = 'Please login first'
        return
    }

    try {
        let response = await fetch(
            supabase_url + '/rest/v1/shopping_cart_table?user_id=eq.' + user_id + '&select=*',
            {
                headers: {
                    'apikey': supabase_key,
                    'Authorization': 'Bearer ' + supabase_key
                }
            }
        )

        let cart = await response.json()
        console.log('cart from supabase:', cart)

        if (!cart || cart.length === 0) {
            container.innerHTML = '<p style="color:rgba(255,255,255,.4);text-align:center;padding:3rem;">Your cart is empty. <a href="../All_Games/all_games.html" style="color:#5865f2;">Browse games</a></p>'
            subtitle.textContent = 'Your cart is empty'
            updatetotals()
            return
        }

        for (let i = 0; i < cart.length; i++) {
            let item = cart[i]
            html += '<div class="cart-item" data-id="' + item.game_id + '" data-price="' + item.game_price + '">'
            html += '<img src="../All_Games/' + (item.image || '') + '" alt="' + item.game_name + '" onerror="this.src=\'https://via.placeholder.com/90x65/1c2748/fff?text=Game\'"/>'
            html += '<div class="item-info">'
            html += '<div class="item-name">' + item.game_name + '</div>'
            html += '<div class="qty-controls">'
            html += '<button class="qty-btn minus">-</button>'
            html += '<span class="qty-display">' + item.qty + '</span>'
            html += '<button class="qty-btn plus">+</button>'
            html += '</div></div>'
            html += '<div class="item-price">$' + (item.game_price * item.qty).toFixed(2) + '</div>'
            html += '<button class="delete-btn" aria-label="Remove item">'
            html += '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">'
            html += '<polyline points="3 6 5 6 21 6"/>'
            html += '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>'
            html += '<path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>'
            html += '</svg></button></div>'
        }

        container.innerHTML = html
        subtitle.textContent = 'You have ' + cart.length + ' item' + (cart.length !== 1 ? 's' : '') + ' in your cart'
        updatetotals()

    } catch (err) {
        console.error('failed to load cart:', err.message)
    }
}


function savecart() {
    let allitems = document.querySelectorAll('.cart-item')
    let items = []

    for (let i = 0; i < allitems.length; i++) {
        let el = allitems[i]
        items.push({
            id: parseInt(el.dataset.id),
            price: parseFloat(el.dataset.price),
            qty: parseInt(el.querySelector('.qty-display').textContent),
            name: el.querySelector('.item-name').textContent,
            image: el.querySelector('img').src
        })
    }

    localStorage.setItem('cart', JSON.stringify(items))
    updatecartbadge()
}


function updatetotals() {
    let allitems = document.querySelectorAll('.cart-item')
    let subtotal = 0

    for (let i = 0; i < allitems.length; i++) {
        let price = parseFloat(allitems[i].dataset.price)
        let qty = parseInt(allitems[i].querySelector('.qty-display').textContent)
        subtotal += price * qty
    }

    let code = document.getElementById('discount-code').value.trim().toUpperCase()
    let rate = discounts[code] || 0
    let discountamt = subtotal * rate
    let total = subtotal - discountamt

    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2)
    document.getElementById('discount-display').textContent = discountamt > 0 ? '-$' + discountamt.toFixed(2) : '$00.00'
    document.getElementById('total').textContent = '$' + total.toFixed(2)

    if (code) {
        sessionStorage.setItem('gv_discount_code', code)
    }
}


function updatecartbadge() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]')
    let count = 0
    for (let i = 0; i < cart.length; i++) {
        count += cart[i].qty || 1
    }
    let badge = document.getElementById('cart_badge')
    if (!badge) return
    badge.textContent = count
    badge.style.display = count > 0 ? 'flex' : 'none'
}


//  deletes a game from supabase cart table
async function removefromsupabase(gameid) {
    try {
        let userdata = localStorage.getItem("loggedInUser")
        if (!userdata) return
        let user = JSON.parse(userdata)
        let user_id = user.id

        let response = await fetch(
            supabase_url + '/rest/v1/shopping_cart_table?user_id=eq.' + user_id + '&game_id=eq.' + gameid,
            {
                method: 'DELETE',
                headers: {
                    'apikey': supabase_key,
                    'Authorization': 'Bearer ' + supabase_key
                }
            }
        )

        if (response.ok) {
            console.log('deleted from supabase ok')
        } else {
            let err = await response.text()
            console.error('delete error:', err)
        }

    } catch (err) {
        console.error('delete failed:', err.message)
    }
}


async function updateqtyinsupabase(gameid, newqty) {
    try {
        let userdata = localStorage.getItem("loggedInUser")
        if (!userdata) return
        let user = JSON.parse(userdata)
        let user_id = user.id

        let response = await fetch(
            supabase_url + '/rest/v1/shopping_cart_table?user_id=eq.' + user_id + '&game_id=eq.' + gameid,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabase_key,
                    'Authorization': 'Bearer ' + supabase_key
                },
                body: JSON.stringify({ qty: newqty })
            }
        )

        if (response.ok) {
            console.log('qty updated in supabase ok')
        } else {
            let err = await response.text()
            console.error('update error:', err)
        }

    } catch (err) {
        console.error('update failed:', err.message)
    }
}


document.getElementById('cart-items').addEventListener('click', function (e) {

    let item = e.target.closest('.cart-item')
    if (!item) return

    let gameid = parseInt(item.dataset.id)
    let display = item.querySelector('.qty-display')
    let price = parseFloat(item.dataset.price)
    let qty = parseInt(display.textContent)

    if (e.target.closest('.delete-btn')) {
        item.style.transition = 'opacity .3s, transform .3s'
        item.style.opacity = '0'
        item.style.transform = 'translateX(20px)'

        setTimeout(function () {
            item.remove()
            savecart()
            updatetotals()

            let remaining = document.querySelectorAll('.cart-item').length
            document.getElementById('cart-subtitle').textContent =
                remaining === 0 ? 'Your cart is empty' : 'You have ' + remaining + ' item' + (remaining !== 1 ? 's' : '') + ' in your cart'

            removefromsupabase(gameid)
        }, 300)

        return
    }

    if (e.target.closest('.plus')) {
        qty = Math.min(qty + 1, 99)
    }
    else if (e.target.closest('.minus')) {
        qty = Math.max(qty - 1, 1)
    } else {
        return
    }

    display.textContent = qty
    item.querySelector('.item-price').textContent = '$' + (price * qty).toFixed(2)
    savecart()
    updatetotals()

    updateqtyinsupabase(gameid, qty)
})


document.getElementById('discount-code').addEventListener('input', updatetotals)


document.addEventListener('DOMContentLoaded', rendercart)