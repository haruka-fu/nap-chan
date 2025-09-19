import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

/**
 * Ping コマンド。
 * - ユーザーがコマンドを実行すると "Pong!" と応答します。
 */
export const CommandData = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong! と応答します'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pong!');
    },
};
