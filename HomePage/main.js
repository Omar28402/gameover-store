
// search 
function searchgames() {
  let input = document.getElementById("search_input").value.toLowerCase()
  let allcards = document.querySelectorAll("#gamescardscontainer")

  for (let i = 0; i < allcards.length; i++) {
    let gametitle = allcards[i].querySelector("h3").textContent.toLowerCase()

    if (gametitle.includes(input)) {
      allcards[i].style.display = "block"
    } else {
      allcards[i].style.display = "none"
    }
  }

}


const SUPABASE_URL = 'https://nwlvmxuchxvfbpuqbsab.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bHZteHVjaHh2ZmJwdXFic2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTU2NDMsImV4cCI6MjA4Njg5MTY0M30.RswqeFtHpHbWF-SWG0Z5wNdf_1WmAvuncSmqccwwv4Q'


// this function runs when user clicks buy now
// it gets the game from supabase then saves it to cart and supabase table
async function addtocart(game_id, image) {

    let game_name, game_price

    try {
        let response = await fetch(
            SUPABASE_URL + '/rest/v1/games_table?id=eq.' + game_id + '&select=name,price',
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'method': 'GET',
                    'Authorization': 'Bearer ' + SUPABASE_KEY
                }
            }
        )

        let data = await response.json()

        if (!data || data.length === 0) {
            alert('Game not found!')
            return
        }

        game_name  = data[0].name
        game_price = data[0].price

    } catch (err) {
        alert('Could not connect to database.')
        return
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]')
    let existing = cart.find(function(item) { return item.id === game_id })

    if (existing) {
        existing.qty += 1
    } else {
        cart.push({ id: game_id, title: game_name, price: game_price, image: image, qty: 1 })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    updatecartbadge()
    showtoast(game_name + ' added to cart!')

    let user_id = null
    let userdata = localStorage.getItem("loggedInUser")
    if (userdata) {
        let user = JSON.parse(userdata)
        if (user.id) user_id = user.id
    }

    if (!user_id) {
        alert('Please login first!')
        return
    }

    try {
        await fetch(SUPABASE_URL + '/rest/v1/shopping_cart_table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                game_id: game_id,
                game_name: game_name,
                game_price: game_price,
                user_id: user_id,
                qty: 1,
                image: image
            })
        })
    } catch (err) {
        console.error('could not save to supabase', err.message)
    }
}


function updatecartbadge() {
    let cart  = JSON.parse(localStorage.getItem('cart') || '[]')
    let count = 0
    for (let i = 0; i < cart.length; i++) {
        count += cart[i].qty || 1
    }

    let badge = document.getElementById('cart_badge')
    if (!badge) return
    badge.textContent = count
    badge.style.display = count > 0 ? 'inline-block' : 'none'
}


function showtoast(message) {
    let toast = document.getElementById('cart-toast')

    if (!toast) {
        toast = document.createElement('div')
        toast.id = 'cart-toast'
        toast.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#1b1a55;color:white;padding:14px 22px;border-radius:10px;font-size:.9rem;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.4);transition:opacity .4s;opacity:0;'
        document.body.appendChild(toast)
    }

    toast.textContent = message
    toast.style.opacity = '1'
    clearTimeout(toast._timer)
    toast._timer = setTimeout(function() { toast.style.opacity = '0' }, 2500)
}


document.addEventListener('DOMContentLoaded', function() {

    let userdata = localStorage.getItem("loggedInUser")
    if (userdata) {
        let user = JSON.parse(userdata)
        let navusername = document.getElementById("nav_username")
        if (navusername) {
            navusername.textContent = user.username
        }
    }

    updatecartbadge()
})