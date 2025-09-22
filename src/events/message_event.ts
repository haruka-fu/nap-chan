/**
 * メッセージイベントの処理。
 * - ユーザーのメッセージを監視し、TTS キューに追加します。
 * - VoiceVox を使用して音声ファイルを生成します。
 */

import { ActionRowBuilder, Events, Message, StringSelectMenuBuilder } from 'discord.js';
import { ttsHandler } from '../utils/tts/ttsHandler';
import logger from '../utils/logger';

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message) {
    if (message.author.bot) return;

    logger.info('message', message.content);
    if (message.content === "なっぷちゃん") {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("single-select")
            .setPlaceholder("1つ選んでください")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                { label: "選択肢A", value: "option_1" },
                { label: "選択肢B", value: "option_2" },
                { label: "選択肢C", value: "option_3" },
            ]);
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
        await message.reply({ content: "選んでね", components: [row] });
        return;
    }
    await ttsHandler(message);
}
