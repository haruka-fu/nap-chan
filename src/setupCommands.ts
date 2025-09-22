/**
 * コマンドの読み    const commands: any[] = [];
    logger.info('System', `コマンドの読み込みを開始します...`);
    for (const file of commandFiles) { Discord API への登録を行うモジュール。
 * - コマンドファイルをスキャンして登録
 * - 既存のコマンドを削除して新しいコマンドを登録
 */

import { REST, Routes, ChatInputCommandInteraction, Events, Interaction } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import logger from './utils/logger';
import { Command } from './types';
import { client } from './main';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

export async function loadAndSetupCommands(clientId: string): Promise<void> {
    const commands = loadCommands();

    // Discord API にコマンドを登録
    try {
        logger.info('Command', `コマンドのセットアップを開始します...`);

        const oldCommands = await rest.get(Routes.applicationCommands(clientId)) as Array<{ id: string, name: string }>;
        for (const command of oldCommands) {
            await rest.delete(Routes.applicationCommand(clientId, command.id));
        }

        await rest.put(Routes.applicationCommands(clientId), { body: commands.map(cmd => cmd.data.toJSON()) });

        logger.info('System', `登録されたコマンド:`);
        for (const command of commands) {
            logger.info('Command', `- ${command.data.name} が登録されました。`);
        }

        logger.info('Command', `コマンドのセットアップが完了しました。`);
    } catch (error: any) {
        logger.error('Command', `コマンドのセットアップ中にエラーが発生しました:`, error);
    }

    // ローカルでコマンドを登録
    for (const command of commands) {
        client.commands.set(command.data.name, command);
    }
}

function loadCommands(): Command[] {
    const commandsPath = join(__dirname, './commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    const commands: Command[] = [];
    logger.info('Command', 'コマンドの読み込みを開始します...');
    for (const file of commandFiles) {
        try {
            const command = require(join(commandsPath, file));
            if (command && command.CommandData && command.CommandData.data && command.CommandData.execute) {
                commands.push(command.CommandData);
            } else {
                logger.warn('Command', `コマンドファイル ${file} は正しい形式ではありません。`);
            }
        } catch (error) {
            logger.error('Command', `コマンドファイル ${file} の読み込み中にエラーが発生しました:`, error);
        }
    }
    return commands;
}
