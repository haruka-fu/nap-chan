import { Client } from 'discord.js';

export const CommandData = {
    name: 'ping',
    description: 'Pong! と応答します',
    execute: (client: Client) => {
        client.on('interactionCreate', async (interaction) => {
            try {
                if (interaction.isCommand() && interaction.commandName === 'ping') {
                    console.log('/ping が呼び出されました');
                    await interaction.reply('Pong!');
                }
            } catch (error) {
                console.error('Command /ping error:', error);
            }
        });
    },
};
