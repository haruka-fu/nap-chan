/**
 * ボイスチャンネルから退出するコマンド。
 * - 現在の接続を破棄し、リソースを解放します。
 */

import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getConnection, clearConnection } from '../voiceConnectionManager';

export const CommandData = {
    data: new SlashCommandBuilder()
        .setName('vcleave')
        .setDescription('なっぷちゃんが VC から退出します'),

    async execute(interaction: ChatInputCommandInteraction) {
        const connection = getConnection();

        if (!connection) {
            await interaction.reply({ content: 'ボイスチャンネルに接続していません。', ephemeral: true });
            return;
        }

        try {
            connection.destroy();
            clearConnection();
            console.log('ボイスチャンネルから退出しました');
            await interaction.reply({ content: 'ボイスチャンネルから退出しました。' });
        } catch (error) {
            console.error('Error leaving voice channel:', error);
            await interaction.reply({ content: 'ボイスチャンネルからの退出でエラーが発生しました。', ephemeral: true });
        }
    },
};
