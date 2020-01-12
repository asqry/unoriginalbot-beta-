const fs = require('fs')
const config = require('../config.json')
let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));


module.exports = {
	name: 'help',
    description: 'List all of my commands or info about a specific command.',
    usage: '[command name]',
	execute(bot, message, args) {
		const data = [];
        const { commands } = bot;

        if(!prefixes[message.guild.id]){
            prefixes[message.guild.id] = {
                prefix: config.prefix
            }

            fs.writeFile("./prefixes.json", JSON.stringify(prefixes), (err) => {
                if (err) console.log(err)
              });
        }
        let prefix = prefixes[message.guild.id].prefix
        

		if (!args.length) {
			data.push('Here\'s a list of all my commands:');
			data.push(commands.map(command => command.name).join('**,** '));
			data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

			return message.channel.send(data, { split: true })
				
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name);

		if (!command) {
			return message.reply('that\'s not a valid command!');
		}

		data.push(`**Name:** \`${command.name}\``);

        if (command.description) data.push(`**Description:** \`${command.description}\``);
        if (command.usage) data.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``);

		message.channel.send(data, { split: true });
	},
};