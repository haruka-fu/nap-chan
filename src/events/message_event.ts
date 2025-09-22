/**
 * メッセージイベントの処理。
 * - ユーザーのメッセージを監視し、TTS キューに追加します。
 * - VoiceVox を使用して音声ファイルを生成します。
 */

import { Events, Message } from 'discord.js';
import { ttsHandler } from '../utils/tts/ttsHandler';

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message) {
    if (message.author.bot) return;
    await ttsHandler(message);
}
