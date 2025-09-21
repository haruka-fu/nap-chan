/**
 * コマンドの読み    const commands: any[] = [];
    logger.info('System', `コマンドの読み込みを開始します...`);
    for (const file of commandFiles) { Discord API への登録を行うモジュール。
 * - コマンドファイルをスキャンして登録
 * - 既存のコマンドを削除して新しいコマンドを登録
 */

import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import logger from './utils/logger';
import { Command } from './types';


export function loadCommands(): Command[] {
    const commandsPath = join(__dirname, 'commands');
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

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

export async function setupCommands(clientId: string, commands: any[]) {
    try {
        logger.info('Command', `コマンドのセットアップを開始します...`);

        // 既存のコマンドを取得
        const oldCommands = await rest.get(Routes.applicationCommands(clientId)) as Array<{ id: string, name: string }>;

        // 既存のコマンドを削除
        for (const command of oldCommands) {
            await rest.delete(Routes.applicationCommand(clientId, command.id));
        }

        // 新しいコマンドを登録
        // Discord API用にtoJSONした配列を送信
        await rest.put(Routes.applicationCommands(clientId), { body: commands.map(cmd => cmd.data.toJSON()) });

        logger.info('System', `登録されたコマンド:`);
        for (const command of commands) {
            logger.info('Command', `- ${command.data.name} が登録されました。`);
        }

        logger.info('Command', `コマンドのセットアップが完了しました。`);
    } catch (error: any) {
        logger.error('Command', `コマンドのセットアップ中にエラーが発生しました:`);
        if (error.rawError) {
            logger.error('Command', `Discord APIエラー:`, error.rawError);
        } else {
            logger.error('Command', ``, error);
        }
    }
}
