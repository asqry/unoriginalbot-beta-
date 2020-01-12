const fs = require('fs')
let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));


module.exports = {
    name: 'ping',
    description: 'Ping!',
        execute(bot, message, args) {
            message.reply("Pong!")
        },
}