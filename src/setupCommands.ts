import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

const commands: any[] = [];
for (const file of commandFiles) {
    const command = require(join(commandsPath, file)).CommandData;
    if (command && command.name && command.description) {
        commands.push(command);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

export async function setupCommands(clientId: string) {
    try {
        console.log(`コマンドのセットアップを開始します...`);
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        for (const cmd of commands) {
            console.log(`登録されているコマンド:`, cmd.name);
        }
        console.log(`コマンドのセットアップが完了しました。`);
    } catch (error) {
        console.error(error);
    }
}
