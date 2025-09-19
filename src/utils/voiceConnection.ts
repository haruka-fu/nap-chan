import { joinVoiceChannel, entersState, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';

/**
 * ボイスチャンネルに接続します。
 * @param voiceChannel - 接続対象のボイスチャンネル
 * @returns VoiceConnection オブジェクト
 */
export async function connectToVoiceChannel(voiceChannel: VoiceChannel): Promise<VoiceConnection> {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
        selfDeaf: false, // スピーカーミュートを解除
        selfMute: false, // マイクミュートを解除
    });

    // 接続完了を待機
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

    // 接続状態の監視
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        } catch {
            connection.destroy(); // リソースを解放
        }
    });

    connection.on('error', (error) => {
        console.error('ボイスチャンネル接続エラー:', error);
    });

    return connection;
}
