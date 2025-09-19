/**
 * ボイスチャンネルの接続状態を確認するコマンド。
 * - 現在の接続状態と設定を表示します。
 */

import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getConnection } from '../voiceConnectionManager';
import { VoiceConnectionStatus } from '@discordjs/voice';

export const CommandData = {
    data: new SlashCommandBuilder()
        .setName('vcstatus')
        .setDescription('ボイスチャンネルの接続状態を確認します'),

    async execute(interaction: ChatInputCommandInteraction) {
        const connection = getConnection();

        if (!connection) {
            await interaction.reply({ content: 'ボイスチャンネルに接続していません。', ephemeral: true });
            return;
        }

        const status = connection.state.status;
        const channelId = connection.joinConfig.channelId;

        let statusText: string;
        let statusEmoji: string;

        switch (status) {
            case VoiceConnectionStatus.Signalling:
                statusText = '接続中 (Signalling)';
                statusEmoji = '🟡';
                break;
            case VoiceConnectionStatus.Connecting:
                statusText = '接続中 (Connecting)';
                statusEmoji = '🟡';
                break;
            case VoiceConnectionStatus.Ready:
                statusText = '接続済み (Ready)';
                statusEmoji = '🟢';
                break;
            case VoiceConnectionStatus.Disconnected:
                statusText = '切断済み (Disconnected)';
                statusEmoji = '🔴';
                break;
            case VoiceConnectionStatus.Destroyed:
                statusText = '破棄済み (Destroyed)';
                statusEmoji = '⚫';
                break;
            default:
                statusText = `不明な状態 (${status})`;
                statusEmoji = '❓';
        }

        // 音声設定の確認
        const joinConfig = connection.joinConfig;
        const audioSettings = `
**音声設定:**
- スピーカーミュート (selfDeaf): ${joinConfig.selfDeaf ? '🔇 ON' : '🔊 OFF'}
- マイクミュート (selfMute): ${joinConfig.selfMute ? '🔇 ON' : '🎤 OFF'}`;

        await interaction.reply({
            content: `**ボイスチャンネル接続状態:**
- 状態: ${statusEmoji} ${statusText}
- チャンネルID: ${channelId}
${audioSettings}

**トラブルシューティング:**
${status !== VoiceConnectionStatus.Ready ? '⚠️ 接続が完了していません' : '✅ 正常に接続されています'}
- VoiceVoxコンテナが起動しているか確認
- Bot権限（接続・発言）が付与されているか確認
- Discord側の音量設定を確認`,
            ephemeral: true
        });
    },
};
