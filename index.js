const Discord = require('discord.js')
const bot = new Discord.Client()
const config = require('./config.json')
const fs = require('fs')
const coins = require('./coins.json')
const xp = require('./xp.json')

function loadCmds(){
    bot.commands = new Discord.Collection();
    bot.aliases = new Discord.Collection();
    bot.usages = new Discord.Collection();
  
  const load = dir => {
    fs.readdir(dir, (err, files) => {
        if(err) throw err;
        const jsfiles = files.filter(f => f.endsWith('.js'));
  
        jsfiles.forEach(f => {
            delete require.cache[require.resolve(`${dir}${f}`)];
  
            const props = require(`${dir}${f}`);
            console.log(`${f} loaded!`);
  
            bot.commands.set(props.help.name, props);
            if (props.help.aliases) props.help.aliases.forEach(alias => bot.aliases.set(alias, props.help.name));
            if(props.help.usages) props.help.usages.forEach(usage => bot.usages.set(usage, props.help.usage));
        });
    });

  }
  
  load("./commands/");
  load("./moderation/")
}

loadCmds()

bot.on('ready', () => {
    console.log("The bot is ready!")
    bot.user.setActivity("Unoriginal", {type: "PLAYING"})
})

bot.on('message', message => {
    if(message.author.bot) return;
  
  if(!coins[message.author.id]){
    coins[message.author.id] = {
      coins: 0
    }
  }

  let coinAmt = Math.floor(Math.random() * 15) + 1;
  let baseAmt = Math.floor(Math.random() * 15) + 1;
  console.log(`${coinAmt} ; ${baseAmt}`);

  if(coinAmt === baseAmt){
    coins[message.author.id] = {
      coins: coins[message.author.id].coins + coinAmt
    };
  fs.writeFile("./coins.json", JSON.stringify(coins), (err) => {
    if (err) console.log(err)
  });
  let coinEmbed = new Discord.RichEmbed()
  .setAuthor(message.author.username)
  .setColor("#0000FF")
  .addField("💸", `${coinAmt} coins added!`);

  message.channel.send(coinEmbed).then(msg => {msg.delete(5000)});
  }
  
  //level system
  
  let xpAdd = Math.floor(Math.random() * 10) + 50;
  console.log(xpAdd);

  if(!xp[message.author.id]){
    xp[message.author.id] = {
      xp: 0,
      level: 1
    };
  }


  let curxp = xp[message.author.id].xp;
  let curlvl = xp[message.author.id].level;
  let nxtLvl = xp[message.author.id].level * 1000;
  xp[message.author.id].xp =  curxp + xpAdd;
  if(nxtLvl <= xp[message.author.id].xp){
    xp[message.author.id].level = curlvl + 1;
    let lvlup = new Discord.RichEmbed()
    .setTitle("Level Up!")
    .setColor("RANDOM")
    .addField("New Level", curlvl + 1);

    message.channel.send(lvlup).then(msg => {msg.delete(5000)});
  }
  fs.writeFile("./xp.json", JSON.stringify(xp), (err) => {
    if(err) console.log(err)
  });
  
  //level system
  
  let prefix = config.prefix //For Now... Change Later
let args = message.content.slice(prefix.length || prefix.length + 1).trim().split(/ +/g)
let cmd = args.shift().toLowerCase();
let command;

if(!message.content.startsWith(prefix)) return;

if(cmd.length === 0) return message.channel.send("Please send a real command");
if(bot.commands.has(cmd)) {
    command = bot.commands.get(cmd);
} else if(bot.aliases.has(cmd)){
    command = bot.commands.get(bot.aliases.get(cmd));
}

if(command) command.run(bot, message, args, used)

if(message.content.startsWith(`${prefix}setgame`)){
    //command starts here

    message.delete().catch()

        let acttype = args.shift(0);

        if(!acttype) return message.channel.send("Please pick a type (Playing, Watching, Listening)")

        let game = args.slice(0).join(" ");

        if(!game) return message.channel.send("Please pick a game for the bot to play!")

        bot.user.setActivity(game, {type: `${acttype}`})

        let embed = new Discord.RichEmbed()
        .setAuthor("The Bot\'s Activity Has Been Set")
        .setColor("YELLOW")
        .addField("Activity Type", acttype, true) //show the specified type
        .addField("Activity Content", game, true) //show the activity specified (args.slice(0).join(" "))
        .setFooter(message.author.username, message.author.displayAvatarURL)

        message.channel.send(embed).then(msg => {
            msg.delete(10000)
        })


    //command ends here
}

});

bot.on('guildMemberAdd', async member => {
    if(member.bot) return;

    member.guild.createChannel(`${member.user.username}-verification`, {type: 'text'}).then(c => {
        const category = member.guild.channels.find(ch => ch.name === '✅ Verification' && ch.type == 'Category')

        c.overwritePermissions(member.id, {
            READ_MESSAGES: true,
            VIEWCHANNEL: true,
            SEND_MESSAGES: true,
            CONNECT: true,
           READ_MESSAGE_HISTORY: true
        }),

        c.overwritePermissions("648341711927640074", { //everyone
            READ_MESSAGES: false,
            VIEW_CHANNEL: false,
          READ_MESSAGE_HISTORY: false
        }),

        c.overwritePermissions("648346903062511627", { //member
            READ_MESSAGES: false,
            VIEW_CHANNEL: false,
           READ_MESSAGE_HISTORY: false
        }),

        c.overwritePermissions("334392742266535957", { //taco
            READ_MESSAGES: true,
            VIEWCHANNEL: true,
            SEND_MESSAGES: true,
            CONNECT: true,
           READ_MESSAGE_HISTORY: true
        })

        c.setParent("649726801173545000")

        let newembed = new Discord.RichEmbed()
        .setColor("GREEN")
        .setDescription("**Please join the provided voice channel, and type \"verifyme\" without the quotation marks to verify yourself**")

        c.send(newembed)

        return
    })

    bot.on('message', async(message) => {
        if(!message.channel.name.includes("-verification")) return;
        if(message.author.bot) return;
        message.delete()

        

        

        if(message.content !== "verifyme"){
            let embed = new Discord.RichEmbed()
            .setColor("RED")
            .setDescription("You didn't enter the correct verification code, please type the code stated in the message above")
            .setFooter(`You entered \"${message.content}\"`)

            message.channel.send(embed).then(msg => msg.delete(15000))

            return;
        }

        if(!message.member.voiceChannel){
            let embed1 = new Discord.RichEmbed()
            .setColor("RED")
            .setDescription("Please join the provided voice channel titled \"#Verification-Voice\"")

            message.channel.send(embed1).then(msg => msg.delete(15000))

            return;
        }

        if(message.member.voiceChannel && message.content === "verifyme"){
            message.member.addRole("658713682725044225")
          
          member.setVoiceChannel("658777325915078697")

            message.channel.delete()
        }
    })
})

bot.on("message", async(message) => { //New chat filter
    let badwords = ["4r5e", "5h1t", "5hit", "a55", "anal", "anus", "ar5e", "arrse", "arse", "ass", "ass-fucker", "asses", "assfucker", "assfukka", "asshole", "assholes", "asswhole", "a_s_s", "b!tch", "b00bs", "b17ch", "b1tch", "ballbag", "balls", "ballsack", "bastard", "beastial", "beastiality", "bellend", "bestial", "bestiality", "bi+ch", "biatch", "bitch", "bitcher", "bitchers", "bitches", "bitchin", "bitching", "bloody", "blow job", "blowjob", "blowjobs", "boiolas", "bollock", "bollok", "boner", "boob", "boobs", "booobs", "boooobs", "booooobs", "booooooobs", "breasts", "buceta", "bugger", "bum", "bunny fucker", "butt", "butthole", "buttmuch", "buttplug", "c0ck", "c0cksucker", "carpet muncher", "cawk", "chink", "cipa", "cl1t", "clit", "clitoris", "clits", "cnut", "cock", "cock-sucker", "cockface", "cockhead", "cockmunch", "cockmuncher", "cocks", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocksucks", "cocksuka", "cocksukka", "cok", "cokmuncher", "coksucka", "coon", "cox", "crap", "cum", "cummer", "cumming", "cums", "cumshot", "cunilingus", "cunillingus", "cunnilingus", "cunt", "cuntlick", "cuntlicker", "cuntlicking", "cunts", "cyalis", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking", "d1ck", "damn", "dick", "dickhead", "dildo", "dildos", "dink", "dinks", "dirsa", "dlck", "dog-fucker", "doggin", "dogging", "donkeyribber", "doosh", "duche", "dyke", "ejaculate", "ejaculated", "ejaculates", "ejaculating", "ejaculatings", "ejaculation", "ejakulate", "f u c k", "f u c k e r", "f4nny", "fag", "fagging", "faggitt", "faggot", "faggs", "fagot", "fagots", "fags", "fanny", "fannyflaps", "fannyfucker", "fanyy", "fatass", "fcuk", "fcuker", "fcuking", "feck", "fecker", "felching", "fellate", "fellatio", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fingerfucks", "fistfuck", "fistfucked", "fistfucker", "fistfuckers", "fistfucking", "fistfuckings", "fistfucks", "flange", "fook", "fooker", "fuck", "fucka", "fucked", "fucker", "fuckers", "fuckhead", "fuckheads", "fuckin", "fucking", "fuckings", "fuckingshitmotherfucker", "fuckme", "fucks", "fuckwhit", "fuckwit", "fudge packer", "fudgepacker", "fuk", "fuker", "fukker", "fukkin", "fuks", "fukwhit", "fukwit", "fux", "fux0r", "f_u_c_k", "gangbang", "gangbanged", "gangbangs", "gaylord", "gaysex", "goatse", "God", "god-dam", "god-damned", "goddamn", "goddamned", "hardcoresex", "hell", "heshe", "hoar", "hoare", "hoer", "homo", "hore", "horniest", "horny", "hotsex", "jack-off", "jackoff", "jap", "jerk-off", "jism", "jiz", "jizm", "jizz", "kawk", "knob", "knobead", "knobed", "knobend", "knobhead", "knobjocky", "knobjokey", "kock", "kondum", "kondums", "kum", "kummer", "kumming", "kums", "kunilingus", "l3i+ch", "l3itch", "labia", "lust", "lusting", "m0f0", "m0fo", "m45terbate", "ma5terb8", "ma5terbate", "masochist", "master-bate", "masterb8", "masterbat*", "masterbat3", "masterbate", "masterbation", "masterbations", "masturbate", "mo-fo", "mof0", "mofo", "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker", "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin", "motherfucking", "motherfuckings", "motherfuckka", "motherfucks", "muff", "mutha", "muthafecker", "muthafuckker", "muther", "mutherfucker", "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah", "niggas", "niggaz", "nigger", "niggers", "nob", "nob jokey", "nobhead", "nobjocky", "nobjokey", "numbnuts", "nutsack", "orgasim", "orgasims", "orgasm", "orgasms", "p0rn", "pawn", "pecker", "penis", "penisfucker", "phonesex", "phuck", "phuk", "phuked", "phuking", "phukked", "phukking", "phuks", "phuq", "pigfucker", "pimpis", "piss", "pissed", "pisser", "pissers", "pisses", "pissflaps", "pissin", "pissing", "pissoff", "poop", "porn", "porno", "pornography", "pornos", "prick", "pricks", "pron", "pube", "pusse", "pussi", "pussies", "pussy", "pussys", "rectum", "retard", "rimjaw", "rimming", "s hit", "s.o.b.", "sadist", "schlong", "screwing", "scroat", "scrote", "scrotum", "semen", "sex", "sh!+", "sh!t", "sh1t", "shag", "shagger", "shaggin", "shagging", "shemale", "shi+", "shit", "shitdick", "shite", "shited", "shitey", "shitfuck", "shitfull", "shithead", "shiting", "shitings", "shits", "shitted", "shitter", "shitters", "shitting", "shittings", "shitty", "skank", "slut", "sluts", "smegma", "smut", "snatch", "son-of-a-bitch", "spac", "spunk", "s_h_i_t", "t1tt1e5", "t1tties", "teets", "teez", "testical", "testicle", "tit", "titfuck", "tits", "titt", "tittie5", "tittiefucker", "titties", "tittyfuck", "tittywank", "titwank", "tosser", "turd", "tw4t", "twat", "twathead", "twatty", "twunt", "twunter", "v14gra", "v1gra", "vagina", "viagra", "vulva", "w00se", "wang", "wank", "wanker", "wanky", "whoar", "whore", "willies", "willy", "xrated", "xxx"];

    //          
    let byepass = []

    if(byepass.includes(message.author.id)) return;
    if(message.author.bot) return;

    let words = message.content.split(/ +/g);
    words.forEach(word => {
        if(badwords.includes(word)){
            message.delete()

            let nosendembed = new Discord.RichEmbed()
                .setColor("RED")
                .setTimestamp()
                .setAuthor("Your message has been deleted\n\nReason: Your message contained a word on our banned word list, please watch your language.")
    
                message.channel.send(nosendembed).then(msg => {
                    msg.delete(5000)
                })

                let logs = message.guild.channels.find(c => c.name === "chat-filter-logs")
    
                let channelid = message.channel.id
    
                let logembed = new Discord.RichEmbed()
                .setColor("RED")
                .setTimestamp()
                .setAuthor(message.author.username)
                .setDescription("\""+`${message.author.username}#${message.author.discriminator}`+"\"" + ` sent a message specified on the banned word list, the message has been deleted`)
                .addField("Message Content:", message.content, true)
                .addBlankField(true)
                .addField("Channel Sent:", message.channel, true)
                .addField("Message ID:", `\`${message.id}\``, true)
    
                logs.send(logembed).then(msg => {
                    msg.react('✅')
                    const unblockFilter = (reaction, user) => reaction.emoji.name === '✅' && user.id === "334392742266535957" || user.id === "396082064987914250";
    
                    const unblock = msg.createReactionCollector(unblockFilter, { time: 900000 })
        
                    unblock.on('collect', r => {
                        message.channel.send(`✅ ${message.author}'s Message has been unblocked and resent! \n\n\`${message.content}\``)
                    })
                })//end of what i just put in
        }
        return
    })
}) //end of new chat filter



bot.login(config.token)