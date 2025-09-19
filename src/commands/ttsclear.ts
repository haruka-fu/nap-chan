/**
 * TTS キューをクリアするコマンド。
 * - 現在の再生を停止し、キュー内のすべてのアイテムを削除します。
 */

import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ttsQueue } from '../ttsQueue';

export const CommandData = {
    data: new SlashCommandBuilder()
        .setName('ttsclear')
        .setDescription('TTS再生キューをクリアします'),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const queueSize = ttsQueue.getSize();
            ttsQueue.clear();

            await interaction.reply({
                content: `TTSキューをクリアしました。(${queueSize}個のアイテムを削除)`,
                ephemeral: true
            });
        } catch (error) {
            console.error('TTS clear error:', error);
            await interaction.reply({
                content: 'TTSキューのクリアでエラーが発生しました。',
                ephemeral: true
            });
        }
    },
};
