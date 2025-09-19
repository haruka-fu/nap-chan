import { VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { ttsQueue } from '../ttsQueue';

/**
 * VC 状態を監視し、切断時にキューをクリアします。
 * @param connection - 監視対象の VoiceConnection
 */
export function monitorVoiceConnection(connection: VoiceConnection): void {
    if (!connection.listenerCount(VoiceConnectionStatus.Disconnected)) {
        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log('[TTS] VC切断検知、キューをクリアします');
            ttsQueue.clear();
        });
    }
}
