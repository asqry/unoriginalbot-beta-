const fs = require("fs");
const Discord = require("discord.js");
const Config = require("./models/config.js");
const mongoose = require("mongoose");
const config = require("./config.json");

//---------------------
mongoose.connect("mongodb://localhost/config", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
console.log("connected to the DB!");
//---------------------

const bot = new Discord.Client();
function loadCmds() {
  bot.commands = new Discord.Collection();

  const commandFiles = fs
    .readdirSync("./commands")
    .filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    let commandName = command.name;
    bot.commands.set(command.name, command);

    console.log(commandName + " loaded!");
  }
}

function loadBot() {
  bot.on("ready", async () => {
    console.log("Ready!");

    bot.guilds.keyArray().forEach(id => {
      Config.findOne(
        {
          guildID: id
        },
        (err, guild) => {
          if (err) console.log(err);

          if (!guild) {
            const defConfig = new Config({
              guildID: id,
              prefix: config.prefix,
              welcomechannel: "None",
              logchannel: "None",
              autorole: "None",
              modrole: "None"
            });

            return defConfig.save();

            console.log("Saved to the DB!")
          }
        }
      );
    });
  });
}

loadCmds();
loadBot();

bot.on("message", async message => {
  if (!message.guild) return;

  Config.findOne(
    {
      guildID: message.guild.id
    },
    (err, guild) => {
      if (err) return console.log(err);

      let prefix = guild.prefix[0]

      if (!message.content.startsWith(prefix) || message.author.bot) return;

      const args = message.content
        .slice(prefix.length)
        .trim()
        .split(/ +/g);
      const command = args.shift().toLowerCase();

      if (command.usage) {
        message.reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
      }

      if (!command) return;

      if (command === "test") {
        Config.findOne(
          {
            guildID: message.guild.id
          },
          (err, guild) => {
            if (err) return console.log(err);
            message.channel.send(guild.prefix);
          }
        );
      }

      if (command === "ping") {
        bot.commands.get("ping").execute(bot, message, args);
      }
      if (command === "help") {
        bot.commands.get("help").execute(bot, message, args);

        console.log(prefix);
      }
      if (command === "settings" || command === "config") {
        message.delete();

        bot.commands.get("settings").execute(bot, message, args);

        // if(args[0] === "prefix"){
        //     let newprefix = args.slice(1)
        //     console.log(newprefix)

        //     bot.guilds.keyArray().forEach(id => {

        //         Config.findOne({
        //             guildID: id
        //         }, (err, guild) => {
        //             if( err) console.log(err);

        //                 const newPrefix = new Config({
        //                     guildID: id,
        //                     prefix: newprefix
        //                 })

        //                 return newPrefix.save()
        //         })

        //     })
        //output data

        //     let newpre = new Discord.RichEmbed()
        //     .setDescription("New Prefix Set :white_check_mark:")
        //     .addField("New Prefix:", newprefix)

        //     message.channel.send(newpre)
        // }

        // message.channel.send("Sorry, this command is temporarily disabled.").then(msg => msg.delete(5000))
      }

      if (command === "getdata") {
      }
      // other commands...
    }
  );
});

bot.on("guildCreate", guild => {
  
  console.log("joined new guild");
});

bot.login(config.token);
