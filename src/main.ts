/**
 * Discord ボットのエントリーポイント。
 * - クライアントの初期化
 * - コマンドとイベントの登録
 * - トークンを使用してログイン
 */

import 'dotenv/config';
import { Client as DiscordClient, GatewayIntentBits, Collection, Interaction, ChatInputCommandInteraction, Events } from 'discord.js';
import { loadCommands } from './setupCommands';
import { join } from 'path';
import { readdirSync } from 'fs';
import { Command } from './types';
import { setupCommands } from './setupCommands';
import logger from './utils/logger';

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
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// ロガーの初期化
logger.info('Main', 'Bot is starting...');

// コマンドの自動登録（loadCommandsで一元管理）
const commands = loadCommands();
for (const command of commands) {
    client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async () => {
    if (!client.user) {
        throw new Error('Client user is not defined.');
    }
    logger.info('System', `${client.user.username} が起動しました`);

    // setupCommandsを呼び出してコマンドを登録（既に読み込んだコマンドを渡す）
    await setupCommands(client.user.id, commands);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        logger.error('Error', `コマンド ${interaction.commandName} が見つかりません。`);
        return;
    }

    try {
        await command.execute(interaction as ChatInputCommandInteraction);
    } catch (error) {
        logger.error('Error', `コマンド ${interaction.commandName} の実行中にエラーが発生しました:`, String(error));
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
            logger.warn('Warning', `イベントファイル ${file} は正しい形式ではありません。`);
        }
    } catch (error) {
        logger.error('Error', `イベントファイル ${file} の読み込み中にエラーが発生しました:`, String(error));
    }
}

// ログイン処理
client.login(token);
