require("dotenv").config();
let db = require("./db");
let http = require("http")
let path = require("path")
let fs = require("fs")

let pathToIndex = path.join(__dirname, "static", "index.html")
let index = fs.readFileSync(pathToIndex, "utf-8")
let pathToStyle = path.join(__dirname, "static", "style.css")
let style = fs.readFileSync(pathToStyle, "utf-8")
let pathToScript = path.join(__dirname, "static", "script.js")
let script = fs.readFileSync(pathToScript, "utf-8")
let { Server } = require("socket.io")


let set = http.createServer((req, res) => {
    switch (req.url) {
        case "/":
            res.writeHead(200, { "content-type": "text/html" })
            res.end(index)
            break
        case "/style.css":
            res.writeHead(200, { "content-type": "text/css" })
            res.end(style)
            break
        case "/script.js":
            res.writeHead(200, { "content-type": "text/js" })
            res.end(script)
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

io.on("connection", function (s) {
    console.log(s.id)
    s.on("message", (data) => {
        console.log(data)
        messages.push(data)
        io.emit("update", JSON.stringify(messages))
    })
})

db.getUser().then(res=>console.log(res)).catch(err=>console.log(err))  