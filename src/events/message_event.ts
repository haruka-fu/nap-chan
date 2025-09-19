import { Message } from 'discord.js';
import { getConnection } from '../voiceConnectionManager';
import { createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import fetch from 'node-fetch';
import fs from 'fs';

export const name = 'messageCreate';
export const once = false;

export async function execute(message: Message) {
    if (message.author.bot) return;
    const connection = getConnection();
    if (!connection) return;

    // VOICEVOX APIで音声生成
    const text = message.content;
    const audioQuery = await fetch('http://localhost:50021/audio_query?text=' + encodeURIComponent(text) + '&speaker=1', { method: 'POST' });
    const queryJson = await audioQuery.json();
    const audioRes = await fetch('http://localhost:50021/synthesis?speaker=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryJson),
    });
    const buffer = await audioRes.buffer();
    const filePath = './tmp_voice.wav';
    fs.writeFileSync(filePath, buffer);

    // VCで再生
    const player = createAudioPlayer();
    const resource = createAudioResource(filePath);
    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
        fs.unlinkSync(filePath);
    });
}
