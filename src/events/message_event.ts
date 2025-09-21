/**
 * メッセージイベントの処理。
 * - ユーザーのメッセージを監視し、TTS キューに追加します。
 * - VoiceVox を使用して音声ファイルを生成します。
 */

import { Message } from 'discord.js';
import { getConnection } from '../voiceConnectionManager';
import { ttsQueue } from '../ttsQueue';
import fs from 'fs';
import { monitorVoiceConnection } from '../utils/voiceConnectionMonitor';

export const name = 'messageCreate';
export const once = false;

// VoiceVox設定用変数
const voiceVoxConfig = {
    speaker: 89, // スピーカーID
    speedScale: 1.4, // 話すスピード
    pitchScale: 0.0, // 声の高さ
    intonationScale: 1.0, // イントネーションの強さ
    volumeScale: 1.0, // 音量
};

export async function execute(message: Message) {
    if (message.author.bot) return;
    const connection = getConnection();
    if (!connection) return;

    monitorVoiceConnection(connection);

    try {
        const text = message.content;
        console.log(`[TTS] 処理開始: "${text}"`);

        const audioQuery = await fetch(`http://voicevox:50021/audio_query?text=${encodeURIComponent(text)}&speaker=${voiceVoxConfig.speaker}`, { method: 'POST' });
        if (!audioQuery.ok) {
            console.error(`[TTS] Audio query failed: ${audioQuery.status}`);
            return;
        }

        const queryJson = await audioQuery.json();

        // VoiceVox設定を適用
        queryJson.speedScale = voiceVoxConfig.speedScale;
        queryJson.pitchScale = voiceVoxConfig.pitchScale;
        queryJson.intonationScale = voiceVoxConfig.intonationScale;
        queryJson.volumeScale = voiceVoxConfig.volumeScale;

        console.log(`[TTS] Audio query成功`);

        const audioRes = await fetch('http://voicevox:50021/synthesis?speaker=' + voiceVoxConfig.speaker, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queryJson),
        });

        if (!audioRes.ok) {
            console.error(`[TTS] Synthesis failed: ${audioRes.status}`);
            return;
        }

        const buffer = Buffer.from(await audioRes.arrayBuffer());
        const filePath = `./tmp/voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.wav`;
        fs.writeFileSync(filePath, buffer);
        console.log(`[TTS] 音声ファイル生成完了: ${filePath}`);

        // キューに追加
        ttsQueue.add(text, filePath);

        // 再生中でなければ再生開始
        if (!ttsQueue.isCurrentlyPlaying()) {
            ttsQueue.startPlayback(connection);
        }

    } catch (error) {
        console.error(`[TTS] 全体エラー:`, error);
    }
}
