import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { pokemonDataList } from '../main';
import { TypeColor } from '../model/pokemon_data_list';
import logger from '../utils/logger';

export const CommandData = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('ポケモンを検索します')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('検索するポケモンの名前')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const pokemonName = interaction.options.getString('name', true);
        const pokemonData = pokemonDataList.find(pokemon => pokemon.name.includes(pokemonName));
        if (!pokemonData) {
            await interaction.reply({ content: `ポケモン「${pokemonName}」が見つかりませんでした。`, flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            const embed = new EmbedBuilder()
                .setTitle('ポケモン情報')
                .setDescription(`選択したポケモンの情報を表示します。`)
                .setColor(TypeColor[pokemonData.type])
                .addFields(
                    { name: 'ポケモン名', value: pokemonName },
                    { name: 'タイプ', value: pokemonData.type || '不明' },
                    { name: '詳細ページ', value: `[詳細はこちら](${pokemonData.pageUrl || 'https://example.com'})` },
                    { name: '戦績ページ', value: `[詳細はこちら](${pokemonData.apiUrl || 'https://example.com'})` },
                )
                .setThumbnail(pokemonData.img || 'https://example.com/default-image.png');
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            logger.error("Command", String(error));
            await interaction.reply({ content: 'ポケモン情報の取得中にエラーが発生しました。', flags: MessageFlags.Ephemeral });
        }
    },
};
