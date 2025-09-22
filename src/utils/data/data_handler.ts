import { EmbedBuilder, Message } from "discord.js";

export async function getEmbedForData(message: Message) {


    await message.reply('はい、なっぷちゃんです！');
    const embed = new EmbedBuilder()
        .setTitle('なっぷちゃん')
        .setDescription('なっぷちゃんは、Discord 用の多機能ボットです。TTS 機能や音楽再生機能など、様々な機能を提供します。')
        .setColor(0x00AE86)
        .setThumbnail('https://example.com/nap-chan-thumbnail.png')
        .addFields(
            { name: 'コマンド一覧', value: '/help でコマンド一覧を表示します。' },
            { name: 'GitHub', value: '[リポジトリはこちら](https://github.com/your-repo)' }
        )
        .setFooter({ text: 'なっぷちゃんをよろしくお願いします！' });
    if (message.channel && 'send' in message.channel) {
        await message.channel.send({ embeds: [embed] });
    }
    return;
}
