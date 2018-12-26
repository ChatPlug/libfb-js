import { login } from "./src/FBMessenger"
require("console-stamp")(console, "[HH:MM:ss.l]")

let config
try {
    config = require("./config.json")
} catch (err) {
    console.dir(err)
    process.exit(1)
}

async function main() {
    const api = await login(config.email, config.password, {})
    console.log('Logged in!')
    api.on('message', async message => {
        console.dir(message)
        if (message.attachments.length) {
            const attach = await api.getAttachmentInfo(message.id, message.attachments[0].id)
            console.dir(attach)
        }
    })
    api.on('event', console.dir)
}
main()
