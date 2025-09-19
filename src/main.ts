import 'dotenv/config';
import { Client as DiscordClient, GatewayIntentBits, Collection, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command } from './types';
import { setupCommands } from './setupCommands';

// Clientクラスを拡張してcommandsプロパティを追加
class Client extends DiscordClient {
    commands: Collection<string, Command>;

    constructor(options: any) {
        super(options);
        this.commands = new Collection();
    }
}

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

// コマンドの自動登録
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
    try {
        const command = require(join(commandsPath, file));
        if (command && command.CommandData && command.CommandData.data && command.CommandData.execute) {
            client.commands.set(command.CommandData.data.name, command.CommandData);
        } else {
            console.warn(`コマンドファイル ${file} は正しい形式ではありません。`);
        }
    } catch (error) {
        console.error(`コマンドファイル ${file} の読み込み中にエラーが発生しました:`, error);
    }
}

client.once('clientReady', async () => {
    if (!client.user) {
        throw new Error('Client user is not defined.');
    }
    console.log(`${client.user.username} が起動しました`);

    // setupCommandsを呼び出してコマンドを登録
    await setupCommands(client.user.id);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`コマンド ${interaction.commandName} が見つかりません。`);
        return;
    }

    try {
        await command.execute(interaction as ChatInputCommandInteraction);
    } catch (error) {
        console.error(`コマンド ${interaction.commandName} の実行中にエラーが発生しました:`, error);
        await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
    }
});

// イベントの自動登録
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of eventFiles) {
    try {
        const event = require(join(eventsPath, file));
        if (event && event.name && event.execute) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        } else {
            console.warn(`イベントファイル ${file} は正しい形式ではありません。`);
        }
    } catch (error) {
        console.error(`イベントファイル ${file} の読み込み中にエラーが発生しました:`, error);
    }
}

// ログイン処理
client.login(token);
