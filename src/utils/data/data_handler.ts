import { ActionRowBuilder, EmbedBuilder, Interaction, Message, StringSelectMenuBuilder, MessageFlags, StringSelectMenuInteraction } from "discord.js";

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

export async function sendSelectMenuForPokemonInfo(interaction: StringSelectMenuInteraction) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("pokemon-info-menu")
        .setPlaceholder("どのポケモンの情報を確認しますか？")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions([
            { label: "ピカチュウ", value: "025" },
            { label: "ヒトカゲ", value: "001" },
            { label: "ゼニガメ", value: "004" },
        ]);
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    await interaction.reply({ content: 'ポケモンを選択してください。', components: [row], flags: MessageFlags.Ephemeral });
    return;
}

export async function sendEmbedForPokemonInfo(interaction: StringSelectMenuInteraction) {
    const selectedValues = interaction.values;
    const embed = new EmbedBuilder()
        .setTitle('ポケモン情報')
        .setDescription('選択したポケモンの情報を表示します。')
        .setColor(0x00AE86)
        .addFields(
            { name: '図鑑番号', value: selectedValues[0] },
            { name: 'ポケモン名', value: 'ピカチュウ' },
            { name: 'タイプ', value: 'でんき' },
            { name: 'とくせい', value: 'せいでんき' }
        )
        .setFooter({ text: 'ポケモン情報をお楽しみください！' });
    await interaction.reply({ embeds: [embed] });
    return;
}
