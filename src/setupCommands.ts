import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

const Commands: any[] = [];
for (const file of commandFiles) {
    try {
        const command = require(join(commandsPath, file));
        if (command && command.CommandData && command.CommandData.data && command.CommandData.execute) {
            Commands.push(command.CommandData.data.toJSON());
            console.log(`コマンド ${command.CommandData.data.name} が登録されました。`);
        } else {
            console.warn(`コマンドファイル ${file} は正しい形式ではありません。`);
        }
    } catch (error) {
        console.error(`コマンドファイル ${file} の読み込み中にエラーが発生しました:`, error);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

export async function setupCommands(clientId: string) {
    try {
        console.log(`コマンドのセットアップを開始します...`);

        // 既存のコマンドを取得
        const oldCommands = await rest.get(Routes.applicationCommands(clientId)) as Array<{ id: string, name: string }>;

        // 既存のコマンドを削除
        for (const command of oldCommands) {
            await rest.delete(Routes.applicationCommand(clientId, command.id));
        }

        // 新しいコマンドを登録
        await rest.put(Routes.applicationCommands(clientId), { body: Commands });

        console.log(`登録されたコマンド:`);
        for (const command of Commands) {
            console.log(`- ${command.name}`);
        }

        console.log(`コマンドのセットアップが完了しました。`);
    } catch (error: any) {
        console.error(`コマンドのセットアップ中にエラーが発生しました:`);
        if (error.rawError) {
            console.error(`Discord APIエラー:`, error.rawError);
        } else {
            console.error(error);
        }
    }
}
