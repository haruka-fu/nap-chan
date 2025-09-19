import { Client, Interaction } from 'discord.js';

export const pingCommand = {
    name: 'ping',
    description: 'Pong! と応答します',
};

export function callPingPong(client: Client) {
    client.on('interactionCreate', async (interaction) => {
        try {
            if (interaction.isCommand() && interaction.commandName === 'ping') {
                console.log('コマンド /ping が呼び出されました');
                await interaction.reply('Pong!');
            }
        } catch (error) {
            console.error('Command /ping error:', error);
        }
    });
}
