import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const CommandData = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong! と応答します'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pong!');
    },
};
