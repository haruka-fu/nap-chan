import { Client, GatewayIntentBits } from 'discord.js';
import { getMessageCreateEvent } from './events';
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
    if (!client.user) {
        throw new Error('Client user is not defined.');
    }
    console.log(`${client.user.username} が起動しました`);
});

getMessageCreateEvent(client);
client.login(token);
