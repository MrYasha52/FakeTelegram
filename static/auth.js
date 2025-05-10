let registerForm = document.querySelector(".register form")

registerForm?.addEventListener("submit", (e) => {
    e.preventDefault()
    let data = new FormData(e.target)
    let login = data.get("login")
    let password = data.get("password")
    let passwordR = data.get("passwordR")
    if (password !== passwordR) {
        alert("passwords are not the same")
        return
    }
    if (password.lenght < 1 || passwordR.lenght < 1 || login.lenght < 1) {
        alert("fields are empty")
        return
    }
    fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({
            login,
            password
        })
    }).then((res) => res.json()).then(res => {
        window.location.href = "/login"
    })

})


let loginForm = document.querySelector(".login form")

loginForm?.addEventListener("submit", (e) => {
    e.preventDefault()
    let data = new FormData(e.target)
    let login = data.get("login")
    let password = data.get("password")
    if (login.lenght < 1 || password.lenght < 1) {
        alert("fields are empty")
        return
    }
    fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({
            login,
            password
        })
    }).then((res) => res.json()).then(res => {
        if(res.status == "ok"){

        document.cookie = "token=" + res.token
        window.location.href = "/"
    }
    })
})
