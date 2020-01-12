const Discord = require("discord.js")
const mongoose = require('mongoose')

module.exports = {
    name: "test",
    description: "test",
    execute(bot, message, args){
        message.delete() 

        //output data
        let test = new Adminrole({
            username: message.author.username,
            userid: message.author.id,
            _id: mongoose.Types.ObjectId()
        })

        test.save().then(result => {
            console.log(result)
        }).catch(err => {
            throw err;
        })
        //output data

        message.channel.send("Saved to the DB! Check compass!")
        
        console.log('test successful')
    },
}