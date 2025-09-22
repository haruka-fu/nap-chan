import { Events, Message, VoiceState } from 'discord.js';
import { ttsHandler } from '../utils/tts/ttsHandler';
import logger from '../utils/logger';

export const name = Events.VoiceStateUpdate;
export const once = false;

export async function execute(oldState: VoiceState, newState: VoiceState) {
    if (oldState.channelId === newState.channelId) return;
    if (oldState.channelId === null) {
        if (newState.channel === null || newState.member === null) return;
        logger.info('VoiceState', `ユーザー ${newState.member.user.tag} がボイスチャンネルに参加しました: ${newState.channel.name}`);
        const msg = {
            content: `${newState.member.displayName} さんが ${newState.channel.name} に参加しました。`,
            author: newState.member.user,
            guild: newState.guild,
            channel: newState.guild.systemChannel
        } as Message;
        await ttsHandler(msg);
        return;
    }
}
