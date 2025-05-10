require("dotenv").config();
let db = require("./db");
let http = require("http")
let path = require("path")
let fs = require("fs")
let bcrypt = require("bcrypt")
let jwt = require("jsonwebtoken")

let pathToIndex = path.join(__dirname, "static", "index.html")
let index = fs.readFileSync(pathToIndex, "utf-8")
let pathToStyle = path.join(__dirname, "static", "style.css")
let style = fs.readFileSync(pathToStyle, "utf-8")
let pathToScript = path.join(__dirname, "static", "script.js")
let script = fs.readFileSync(pathToScript, "utf-8")
let pathToRegister = path.join(__dirname, "static", "register.html")
let register = fs.readFileSync(pathToRegister, "utf-8")
let pathTologin = path.join(__dirname, "static", "login.html")
let loginPage = fs.readFileSync(pathTologin, "utf-8")
let pathToauth = path.join(__dirname, "static", "auth.js")
let auth = fs.readFileSync(pathToauth, "utf-8")
let { Server } = require("socket.io")


let set = http.createServer((req, res) => {
    switch (req.url) {
        case "/":
            res.writeHead(200, { "content-type": "text/html" })
            res.end(index)
            break
        case "/register":
            res.writeHead(200, { "content-type": "text/html" })
            res.end(register)
            break
        case "/login":
            res.writeHead(200, { "content-type": "text/html" })
            res.end(loginPage)
            break
        case "/style.css":
            res.writeHead(200, { "content-type": "text/css" })
            res.end(style)
            break
        case "/script.js":
            res.writeHead(200, { "content-type": "text/js" })
            res.end(script)
            break
        case "/auth.js":
            res.writeHead(200, { "content-type": "text/js" })
            res.end(auth)
            break
        case "/api/register":
            let data = ""
            req.on("data", chunk => {
                data += chunk
            })
            req.on("end", async () => {
                data = JSON.parse(data)
                console.log(data)
                let hash = await bcrypt.hashSync(data.password, 10)
                console.log(hash)
                console.log(await bcrypt.compare(data.password, hash))
                if(await db.checkExists(data.login)){
                    res.end("user exists")
                    return
                }
                await db.addUser(data.login, hash).catch(err=>console.log(err))

                res.end(JSON.stringify({link: "/login"}))
            })
            break
        case "/api/login":
            let data1 = ""
            req.on("data", chunk => {
                data1 += chunk
            })
            req.on("end", async () => {
                let data = JSON.parse(data1)
                let info = await db.getUserByLogin(data.login)
                if(info.length == 0){
                    res.end(JSON.stringify({link: "/register"}))
                    return
                }
                if(await bcrypt.compare(data.password, info[0].password)){
                    let token = jwt.sign({id: info[0].id}, "Nikita", {expiresIn: "1h"})
                    res.end(JSON.stringify({status: "ok", token}))
                    return
                }else{
                    res.end(JSON.stringify({status: "error"}))
                }
                res.end(JSON.stringify({link: "/register"}))
            })
            break
        default:
            res.writeHead(404, { "content-type": "text/html" })
            res.end("<h1>404</h1>")
    }
}).listen(3000, () => {
    console.log("Server started")
})

let io = new Server(set)

let messages = []

io.on("connection", async function (s) {
    console.log(s.id)
    let messages = await db.getMessages()
    messages = messages.map(m => ({ name: m.login, text: m.content }))
    io.emit("update", JSON.stringify(messages))
    s.on("message", async (data) => {
        data = JSON.parse(data)
        await db.addMessage(data.text, 1)
        let messages = await db.getMessages()
        messages = messages.map(m => ({ name: m.login, text: m.content }))
        io.emit("update", JSON.stringify(messages))
    })
})

// db.getUser().then(res=>console.log(res)).catch(err=>console.log(err))  