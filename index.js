const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();
//  api calls 
const fetch = require('node-fetch');



client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();



const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
prefix = "$";

client.once('ready', () => {
    console.log('Ready!');
});



// APPI CALL 


// logging to the console about the msgs sent form the bot
// TOO MUCH OF SPAM DO NOT UNCOMMENT
// client.on('message', message => {
//     console.log(`${message.author.tag} in #${message.channel.name} sent: ${message.content}`);
// });
//if message on strated with Proper prefix





client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'cat') {
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
        message.channel.send(file);
    }



    if (command === "react") {
        message.reply('You hav got 1 second to reavt to an emoji')
        message.react('👍').then(() => message.react('👎'));

        const filter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '👍') {
                    message.reply('you reacted with a thumbs up.');
                } else {
                    message.reply('you reacted with a thumbs down.');
                }
            })
            .catch(collected => {
                message.reply('you reacted with neither a thumbs up, nor a thumbs down.');
            });

    }





    if (command === `${prefix}help`) {
        message.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                title: "Commands to use the bot",
                url: "",
                description: "Fun commands to use",
                description: "$fun to view more fun commands",
                fields: [{
                    name: "use $server to View server commands"
                },
                {
                    name: "use $abt to know how this bot was made :)",
                    value: "You can put [masked links](http://google.com) inside of rich embeds."
                },
                {
                    name: "Markdown",
                    value: "You can put all the *usual* **__Markdown__** inside of them."
                }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "© Node bot"
                }
            }
        });


    }

    if (command === `${prefix}bot`) {
        message.channel.send({
            embed: {
                color: 3447003,
                description: "Well am a bot Who's not that fun as the other bot's :( "
            }
        });


    }







    if (!command) return;

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply('You can not do this!');
        }
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }





    // cooldowns

    const { cooldowns } = client;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    // How the bot shd look





    // FUN HELP!!!!!

    if (command === `${prefix} fun`) {
        message.channel.send('Message to use for Fun');
        message.channel.send({
            embed: {
                color: 3447003,
                title: "Fun Commands",
                description: "$ping, $beep, $avtar, $cat , $foo , $prune",

                description: "These are the commands for now am sry my developer Sucks!!",
            }
        });

    }

    // Serverr help
    if (command === `${prefix}server`) {
        message.channel.send('Server commands');
        message.channel.send({
            embed: {
                color: 3447003,
                title: "server commmands",
                description: "$user, $server , $kick  "

            }
        })


    }


    if (command === 'ping') {
        message.channel.send('Pong.');
    } else if (command === 'beep') {
        message.channel.send('Boop.');
    } else if (command === 'server') {
        message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
    } else if (command === 'user') {
        message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    } else if (command === 'info') {
        if (!args.length) {
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        } else if (args[0] === 'foo') {
            return message.channel.send('bar');
        }

        message.channel.send(`First argument: ${args[0]}`);
    } else if (command === 'kick') {
        if (!message.mentions.users.size) {
            return message.reply('you need to tag a user in order to kick them!');
        }

        const taggedUser = message.mentions.users.first();


        message.channel.send(`You wanted to kick: ${taggedUser.username}`);

    } else if (command === 'avatar') {
        if (!message.mentions.users.size) {
            return message.channel.send(`Your avatar: ${message.author.displayAvatarURL({ dynamic: true })}`);
        }

        const avatarList = message.mentions.users.map(user => {
            return `${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`;
        });

        message.channel.send(avatarList);
    } else if (command === 'prune') {
        const amount = parseInt(args[0]) + 1;

        if (isNaN(amount)) {
            return message.reply('that doesn\'t seem to be a valid number.');
        } else if (amount <= 1 || amount > 100) {
            return message.reply('you need to input a number between 1 and 99.');
        }

        message.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            message.channel.send('there was an error trying to prune messages in this channel!');
        });
    }
});


// login to Discord with your app's token
client.login(config.BOT_TOKEN);