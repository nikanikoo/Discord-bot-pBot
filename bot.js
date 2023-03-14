const PBot = require('./index.js');
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const date = new Date();
const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}.${date.getMinutes()}`;
const logStream = fs.createWriteStream(`logs/${formattedDate}.txt`, { flags: 'a' });


const bot = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
});


bot.on('ready', () => {
    console.log(`${bot.user.tag}: i am ready!`);
});


bot.on('messageCreate', async (message) => {
    const channel = message.channel;
    if(message.author.bot) {return;}
    let pBot = new PBot(process.env.NAME, process.env.LANG);
    channel.sendTyping();
    logStream.write(`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`);
    logStream.write(` Server: ${message.guild.name} | ID: ${message.guild.id}\n | Created At: ${message.createdAt}`);
    logStream.write(`\n ${message.author.username}: ${message.content}\n - ${message.createdTimestamp}`);
    await pBot.init();
    messageBot = await pBot.say(message.content);
    logStream.write(`\n Bot: ${messageBot}\n | Created At: ${new Date()}\n`);
    message.reply(messageBot);
    logStream.write(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`);
    pBot.destroy();
});


bot.login(process.env.TOKEN).then(() => {   
    bot.user.setPresence({ activities: [{ name: 'by Nikori#8953', type: 'PLAYING' }], status: 'online' });
});