import { ActionRowBuilder, EmbedBuilder, Message, MessageFlags, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { pokemonDataList } from "../../main";

export async function sendEmbedForData(message: Message) {
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

export async function sendEmbedForPokemonInfo(interaction: StringSelectMenuInteraction) {
    try {
        const selectedValues = interaction.values;
        const selectedPokemon = pokemonDataList.find(pokemon => String(pokemon.id) === selectedValues[0]);
        if (selectedValues.length === 0) {
            await interaction.reply({ content: 'ポケモンが選択されていません。', flags: MessageFlags.Ephemeral });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('ポケモン情報')
            .setDescription('選択したポケモンの情報を表示します。')
            .setColor(0x00AE86)
            .addFields(
                { name: 'ポケモン名', value: selectedPokemon?.name || '不明' },
            )
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error("Error in sendEmbedForPokemonInfo:", error);
        await interaction.reply({ content: 'ポケモン情報の取得中にエラーが発生しました。', flags: MessageFlags.Ephemeral });
    }
    return;
}
