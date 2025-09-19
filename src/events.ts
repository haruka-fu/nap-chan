import { Client } from 'discord.js';

export function getMessageCreateEvent(client: Client) {
    client.on('messageCreate', (message) => {
        console.log(message.content);
        if (message.author.bot) return;
        if (message.content === 'なっぷちゃん') {
            message.reply('こんにちは、なっぷちゃんです。');
        }
    });
}
