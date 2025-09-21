/**
 * コマンドの読み込みと Discord API への登録を行うモジュール。
 * - コマンドファイルをスキャンして登録
 * - 既存のコマンドを削除して新しいコマンドを登録
 */

import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';


export function loadCommands() {
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    const commands: any[] = [];
    console.log(`[System] コマンドの読み込みを開始します...`);
    for (const file of commandFiles) {
        try {
            const command = require(join(commandsPath, file));
            if (command && command.CommandData && command.CommandData.data && command.CommandData.execute) {
                commands.push(command.CommandData);
            } else {
                console.warn(`[Error] コマンドファイル ${file} は正しい形式ではありません。`);
            }
        } catch (error) {
            console.error(`[Error] コマンドファイル ${file} の読み込み中にエラーが発生しました:`, error);
        }
    }
    return commands;
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

export async function setupCommands(clientId: string, commands: any[]) {
    try {
        console.log(`[System] コマンドのセットアップを開始します...`);

        // 既存のコマンドを取得
        const oldCommands = await rest.get(Routes.applicationCommands(clientId)) as Array<{ id: string, name: string }>;

        // 既存のコマンドを削除
        for (const command of oldCommands) {
            await rest.delete(Routes.applicationCommand(clientId, command.id));
        }

        // 新しいコマンドを登録
        // Discord API用にtoJSONした配列を送信
        await rest.put(Routes.applicationCommands(clientId), { body: commands.map(cmd => cmd.data.toJSON()) });

        console.log(`[System] 登録されたコマンド:`);
        for (const command of commands) {
            console.log(`- ${command.data.name} が登録されました。`);
        }

        console.log(`[System] コマンドのセットアップが完了しました。`);
    } catch (error: any) {
        console.error(`[Error] コマンドのセットアップ中にエラーが発生しました:`);
        if (error.rawError) {
            console.error(`[Error] Discord APIエラー:`, error.rawError);
        } else {
            console.error(`[Error]`, error);
        }
    }
}
