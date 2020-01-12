const mongoose = require('mongoose')

const setconfig = new mongoose.Schema({
    guildID: String,
    prefix: Array,
    welcomechannel: String,
    logchannel: String,
    autorole: String,
    modrole: String
})

let SetConfig = mongoose.model('Settings', setconfig)

module.exports = SetConfig;

console.log("Updated the DB!")