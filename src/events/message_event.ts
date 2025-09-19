import { Message } from 'discord.js';

export const name = 'messageCreate';
export const once = false;

export async function execute(message: Message) {
    console.log(message.content);
    if (message.author.bot) return;
    if (message.content === 'なっぷちゃん') {
        await message.reply('こんにちは、なっぷちゃんです。');
    }
}
