// supabase info
var api_url = "https://nwlvmxuchxvfbpuqbsab.supabase.co"
var api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bHZteHVjaHh2ZmJwdXFic2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTU2NDMsImV4cCI6MjA4Njg5MTY0M30.RswqeFtHpHbWF-SWG0Z5wNdf_1WmAvuncSmqccwwv4Q"


// signup - validate fields then save new user to supabase
async function signupform(e) {
    e.preventDefault()

    var username = document.getElementById("for_username").value
    var email = document.getElementById("for_email").value
    var phone_number = document.getElementById("for_phone").value
    var password = document.getElementById("for_password").value
    var confirmpass = document.getElementById("for_confirm_password").value

    var username_error = document.getElementById("username_error")
    var email_error = document.getElementById("email_error")
    var phone_error = document.getElementById("phone_error")
    var pass_error = document.getElementById("pass_error")
    var confirm_pass_error = document.getElementById("confirm_pass_error")
    var server_error = document.getElementById("server_error")
    var success_msg = document.getElementById("success_msg")

    var valid = true

    if (username === "") {
        username_error.textContent = "Username is required"
        username_error.hidden = false
        valid = false
    } else if (username.length < 3) {
        username_error.textContent = "Username must be at least 3 characters"
        username_error.hidden = false
        valid = false
    }

    if (email === "") {
        email_error.textContent = "Email is required"
        email_error.hidden = false
        valid = false
    }

    if (phone_number === "") {
        phone_error.textContent = "Phone number is required"
        phone_error.hidden = false
        valid = false
    }

    if (password === "") {
        pass_error.textContent = "Password is required"
        pass_error.hidden = false
        valid = false
    } else if (password.length < 6) {
        pass_error.textContent = "Password must be at least 6 characters"
        pass_error.hidden = false
        valid = false
    }

    if (confirmpass !== password) {
        confirm_pass_error.textContent = "Passwords do not match"
        confirm_pass_error.hidden = false
        valid = false
    }

    if (!valid) return

    try {
        var response = await fetch(api_url + "/rest/v1/users_table", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": api_key,
                "Authorization": "Bearer " + api_key,
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({ username, email, phone_number, password })
        })

        if (response.status < 200 || response.status >= 300) {
            var errbody = await response.json()
            server_error.textContent = errbody.message || "Signup failed. Try again."
            server_error.hidden = false
            return
        }

        localStorage.setItem("loggedInUser", JSON.stringify({ username, email }))
        success_msg.textContent = "Account created successfully"
        success_msg.hidden = false

        setTimeout(function() { window.location.href = "Login.html" }, 1500)

    } catch (err) {
        console.error("signup error:", err)
    }
}


// login - check user in supabase then save to localstorage
async function loginform(e) {
    e.preventDefault()

    var email = document.getElementById("for_email").value.trim()
    var password = document.getElementById("for_password").value

    var email_error = document.getElementById("email_error")
    var pass_error = document.getElementById("pass_error")

    var valid = true

    if (email === "") {
        email_error.textContent = "You must enter your email"
        email_error.hidden = false
        valid = false
    } else if (!email.includes("@") || !email.includes(".")) {
        email_error.textContent = "Enter a valid email address"
        email_error.hidden = false
        valid = false
    }

    if (password === "") {
        pass_error.textContent = "You must enter your password"
        pass_error.hidden = false
        valid = false
    } else if (password.length < 6) {
        pass_error.textContent = "Password must be at least 6 characters"
        pass_error.hidden = false
        valid = false
    }

    if (!valid) return

    try {
        var response = await fetch(
            api_url + "/rest/v1/users_table?email=eq." + email + "&select=id,username,email,password",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": api_key,
                    "Authorization": "Bearer " + api_key
                }
            }
        )

        var users = await response.json()

        if (users.length === 0 || users[0].password !== password) {
            pass_error.textContent = "Invalid email or password"
            pass_error.hidden = false
            return
        }

        var id = users[0].id
        var username = users[0].username

        localStorage.setItem("loggedInUser", JSON.stringify({ id, username, email }))
        window.location.href = "../HomePage/homepage.html"

    } catch (err) {
        console.error("login error:", err)
    }
}