const Discord = require('discord.js')
const mongoose = require('mongoose')
const Config = require('../models/config.js')

const config = require('../config.json')




module.exports = {
    name: 'settings',
    description: 'Configure the bot to work with your guild',
    usage: '[setting] [preference] (All Channel/Role settings only work with IDs as of now)',
        execute(bot, message, args){
            Config.findOne({
                guildID: message.guild.id
            }, (err, guild) => {
                if(err) return console.log(err)
            
                let prefix = guild.prefix

            if(!args[0]){
                let settings = new Discord.RichEmbed()
                .setThumbnail(message.guild.iconURL)
                .addField(":gear: Prefix", `Current Prefix: \`${prefix}\``, true)
                .addBlankField(true)
                // .addField(":wave: Welcome Channel", `Current Selected: **<#${wc[message.guild.id].channel}>**`, true)
                // .addBlankField()
                // .addField("🗒️ Logs Channel", `Current Selected: **<#${lc[message.guild.id].channel}>**`, true)
                // .addBlankField(true)
                // .addField("🤖 Autorole", `Current Selected: **<@&${ar[message.guild.id].role}>**`, true)
                // .addBlankField()
                // .addField(":hammer_pick: Mod Role", `Current Selected: **<@&${mr[message.guild.id].role}>**`, true)
                // .addBlankField(true)

                .setFooter(`Requested by ${message.author.username}#${message.author.discriminator}`,  message.author.displayAvatarURL)

                message.channel.send(settings)

                return;
            }
        })

            if(args[0] === "prefix"){
                let newprefix = args.slice(1)
                console.log(newprefix)

                bot.guilds.keyArray().forEach(id => {
                        Config.findOne({
                    guildID: id
                }, (err, guild) => {
                    if( err) console.log(err);
            const newPrefix = new Config({
                    guildID: guild.id,
                    prefix: newprefix
            })

            Config.update({guildID: message.guild.id}, {$push: {prefix: newprefix}})

            newPrefix.save()

            
                })
                })

                let newpre = new Discord.RichEmbed()
                .setDescription("New Prefix Set :white_check_mark:")
                .addField("New Prefix:", newprefix)

                message.channel.send(newpre)
            }
            
        },
}