/**
 * Discord ボットのエントリーポイント。
 * - クライアントの初期化
 * - コマンドとイベントの登録
 * - トークンを使用してログイン
 */

import 'dotenv/config';
import { Client as DiscordClient, GatewayIntentBits, Collection, Events } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import { Command } from './types';
import logger from './utils/logger';
import { loadAndSetupCommands } from './setupCommands';
import { interaction_handler } from './utils/interaction/interaction_handler';
import { fetchPokemonList } from './utils/data/get_pokemon_data';
import { PokemonData } from './model/pokemon_data_list';

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

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// ロガーの初期化
logger.info('Main', 'Bot is starting...');

export let pokemonDataList: PokemonData[] = [];
client.once(Events.ClientReady, async () => {
    if (!client.user) {
        throw new Error('Client user is not defined.');
    }
    logger.info('System', `${client.user.username} が起動しました`);

    await loadAndSetupCommands(client.user.id);
    pokemonDataList = await fetchPokemonList();
    console.log("ポケモンwikiデータ取得件数:", pokemonDataList.length);
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

client.on(Events.InteractionCreate, async (interaction) => {
    interaction_handler(interaction);
});

// ログイン処理
client.login(token);
