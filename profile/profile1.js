const SUPABASE_URL = 'https://nwlvmxuchxvfbpuqbsab.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bHZteHVjaHh2ZmJwdXFic2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTU2NDMsImV4cCI6MjA4Njg5MTY0M30.RswqeFtHpHbWF-SWG0Z5wNdf_1WmAvuncSmqccwwv4Q';


async function loadpersonalinfo() {

    // get the user from localstorage
    let userdata = localStorage.getItem("loggedInUser")

    // if no user found send them to login page
    if (!userdata) {
        window.location.href = '../login/Login.html'
        return
    }

    let user = JSON.parse(userdata)

    let navusername = document.getElementById('nav_username')
    if (navusername) {
        navusername.textContent = user.username
    }

    let greeting = document.querySelector('.dash-greeting')
    if (greeting) {
        greeting.textContent = 'Hello ' + user.username + '!'
    }

    try {
        let response = await fetch(
            SUPABASE_URL + '/rest/v1/users_table?id=eq.' + user.id + '&select=*',
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY
                }
            }
        )

        let data = await response.json()

        if (data && data.length > 0) {
            document.getElementById('pi-name').value  = data[0].username     || ''
            document.getElementById('pi-email').value = data[0].email        || ''
            document.getElementById('pi-phone').value = data[0].phone_number || ''
        }

    } catch (err) {
        console.error('something went wrong loading profile', err.message)
    }
}


async function savepersonalinfo() {

    let name  = document.getElementById('pi-name').value.trim()
    let email = document.getElementById('pi-email').value.trim()
    let phone = document.getElementById('pi-phone').value.trim()

    if (!name || !email) {
        alert('Name and email are required.')
        return
    }

    let userdata = localStorage.getItem("loggedInUser")
    if (!userdata) {
        alert('You must be logged in.')
        return
    }

    let user = JSON.parse(userdata)

    try {
        let response = await fetch(
            SUPABASE_URL + '/rest/v1/users_table?id=eq.' + user.id,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY
                },
                body: JSON.stringify({
                    username: name,
                    email: email,
                    phone_number: phone
                })
            }
        )

        if (response.ok) {
            localStorage.setItem("loggedInUser", JSON.stringify({
                id: user.id,
                username: name,
                email: email
            }))

            alert('Profile saved!')

            let greeting = document.querySelector('.dash-greeting')
            if (greeting) {
                greeting.textContent = 'Hello ' + name + '!'
            }

        } else {
            alert('Failed to save. Try again.')
        }

    } catch (err) {
        console.error('something went wrong saving profile', err.message)
        alert('Failed to save. Try again.')
    }
}


async function loadorders() {

    let list = document.getElementById('orders-list')
    if (!list) return

    let userdata = localStorage.getItem("loggedInUser")
    if (!userdata) {
        list.innerHTML = '<p style="color:rgba(255,255,255,.4);text-align:center;padding:2rem">Please login to view orders.</p>'
        return
    }

    let user = JSON.parse(userdata)

    try {
        let response = await fetch(
            SUPABASE_URL + '/rest/v1/shopping_cart_table?user_id=eq.' + user.id + '&select=*',
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY
                }
            }
        )

        let orders = await response.json()

        if (!orders || orders.length === 0) {
            list.innerHTML = '<p style="color:rgba(255,255,255,.4);text-align:center;padding:2rem">No orders yet.</p>'
            return
        }

        let html = ''
        for (let i = 0; i < orders.length; i++) {
            let item = orders[i]
            html += `
                <div style="display:flex;align-items:center;gap:1rem;padding:1rem;border-bottom:1px solid rgba(255,255,255,.1);">
                    <img src="../All_Games/${item.image || ''}" style="width:80px;height:55px;object-fit:cover;border-radius:6px;"
                         onerror="this.src='https://via.placeholder.com/80x55/1c2748/fff?text=Game'"/>
                    <div style="flex:1;">
                        <div style="color:white;font-weight:600;">${item.game_name}</div>
                        <div style="color:rgba(255,255,255,.5);font-size:.85rem;">Qty: ${item.qty}</div>
                    </div>
                    <div style="color:#3ecf8e;font-weight:700;">$${parseFloat(item.game_price).toFixed(2)}</div>
                </div>
            `
        }

        list.innerHTML = html

    } catch (err) {
        console.error('something went wrong loading orders', err.message)
        list.innerHTML = '<p style="color:#ff6b6b;text-align:center;padding:2rem">Failed to load orders.</p>'
    }
}


function showpanel(name, el) {
    let panels = document.querySelectorAll('.content-panel')
    for (let i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active')
    }

    let sideitems = document.querySelectorAll('.sidebar-item')
    for (let i = 0; i < sideitems.length; i++) {
        sideitems[i].classList.remove('active')
    }

    document.getElementById('panel-' + name).classList.add('active')

    if (el) {
        el.classList.add('active')
    }

    // if orders panel load the orders
    if (name === 'orders') {
        loadorders()
    }
}


// this function opens and closes the payment accordion
function toggleaccordion(bodyid, chevid) {
    let body = document.getElementById(bodyid)
    let chev = document.getElementById(chevid)

    if (body.style.display === 'block') {
        body.style.display = 'none'
    } else {
        body.style.display = 'block'
    }

    chev.classList.toggle('open')
}


// this formats the card number with spaces every 4 digits
function fmtcard(el) {
    el.value = el.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
}


// this formats the expiry date with a slash like 12/26
function fmtexp(el) {
    el.value = el.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5)
}


// demo only - add card button
function addcardmethod() {
    alert('Card added (demo only).')
}


function addpaypal() {
    alert('PayPal connected (demo only).')
}


document.addEventListener('DOMContentLoaded', loadpersonalinfo)