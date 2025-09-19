import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { getMessageCreateEvent } from './events';
import * as SetupCommands from './setupCommands';
import { CommandData } from './commands/ping';

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
    SetupCommands.setupCommands(client.user.id);
});

// コマンドのイベントリスナーを設定
CommandData.execute(client);

// イベントリスナーの設定
getMessageCreateEvent(client);

// ログイン処理
client.login(token);
