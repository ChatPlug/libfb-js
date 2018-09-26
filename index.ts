import login from "./src/FBMessenger"
require("console-stamp")(console, "[HH:MM:ss.l]")

let config
try {
    config = require("./config.json")
} catch (err) {
    console.dir(err)
    process.exit(1)
}

login(config.email, config.password)
    .then()
    .catch()
