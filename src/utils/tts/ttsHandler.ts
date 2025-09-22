import { getConnection } from "../../voiceConnectionManager";
import logger from "../logger";
import { monitorVoiceConnection } from "../voiceConnectionMonitor";
import { TTSQueue } from "./ttsQueue";
import * as fs from "fs";

// VoiceVox設定用変数
const voiceVoxConfig = {
    speaker: 89, // スピーカーID
    speedScale: 1.4, // 話すスピード
    pitchScale: 0.0, // 声の高さ
    intonationScale: 1.0, // イントネーションの強さ
    volumeScale: 1.0, // 音量
};

const ttsQueue = new TTSQueue();

export async function ttsHandler(message: import("discord.js").Message) {
    const connection = getConnection();
    if (!connection) return;

    monitorVoiceConnection(connection);

    try {
        const text = message.content;
        logger.info('TTS', `処理開始: "${text}"`);

        const audioQuery = await fetch(`http://voicevox:50021/audio_query?text=${encodeURIComponent(text)}&speaker=${voiceVoxConfig.speaker}`, { method: 'POST' });
        const queryJson = await handleFetchError(audioQuery, 'TTS');

        queryJson.speedScale = voiceVoxConfig.speedScale;
        queryJson.pitchScale = voiceVoxConfig.pitchScale;
        queryJson.intonationScale = voiceVoxConfig.intonationScale;
        queryJson.volumeScale = voiceVoxConfig.volumeScale;

        const audioRes = await fetch('http://voicevox:50021/synthesis?speaker=' + voiceVoxConfig.speaker, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queryJson),
        });

        const buffer = Buffer.from(await handleFetchError(audioRes, 'TTS'));
        const filePath = `./tmp/voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.wav`;
        fs.writeFileSync(filePath, buffer);

        // キューに追加
        ttsQueue.add(text, filePath);

        // 再生中でなければ再生開始
        if (!ttsQueue.isCurrentlyPlaying()) {
            ttsQueue.startPlayback(connection);
        }

    } catch (error) {
        logger.error('Error', '全体エラー:', error);
    }
}

async function handleFetchError(response: Response, context: string): Promise<any> {
    if (!response.ok) {
        logger.error(context, `Fetch failed with status: ${response.status}`);
        throw new Error(`Fetch failed with status: ${response.status}`);
    }
    return response.json();
}
