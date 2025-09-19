import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

const token = process.env.DISCORD_TOKEN;
if (!token) {
    throw new Error('DISCORD_TOKEN is not set in the environment variables.');
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('clientReady', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

// ping-pong 応答
client.on('messageCreate', (message) => {
    console.log(message.content);
    if (message.author.bot) return;
    if (message.content === 'ping') {
        message.reply('pong');
    }
});

client.login(token);
