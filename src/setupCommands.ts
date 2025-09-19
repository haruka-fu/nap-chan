import { REST, Routes } from 'discord.js';
import { pingCommand } from './commands/ping';

const commands = [
    pingCommand
]

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

export async function deployCommands(clientId: string) {
    try {
        console.log(`コマンドのセットアップを開始します...`);
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        console.log(`コマンドのセットアップが完了しました。`);
    } catch (error) {
        console.error(error);
    }
}
