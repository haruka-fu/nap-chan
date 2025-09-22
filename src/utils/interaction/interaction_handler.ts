import { CacheType, ChatInputCommandInteraction, Interaction, StringSelectMenuInteraction, } from 'discord.js';
import { client } from "../../main";
import logger from '../logger';

export async function interaction_handler(interaction: Interaction) {
    try {
        if (interaction.isCommand()) return await executeCommand(interaction);
        if (interaction.isStringSelectMenu()) return await executeSelectMenu(interaction);
    } catch (error) {
        logger.error('Error', 'インタラクションの処理中にエラーが発生しました:', String(error));
    }
    return;
}

async function executeCommand(interaction: Interaction) {
    console.log("Command Interaction Created");
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        logger.error('Error', `コマンド ${interaction.commandName} が見つかりません。`);
        return;
    }

    try {
        await command.execute(interaction as ChatInputCommandInteraction);
    } catch (error) {
        logger.error('Error', `コマンド ${interaction.commandName} の実行中にエラーが発生しました:`, String(error));
        await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
    }
}

async function executeSelectMenu(interaction: Interaction) {
    const selectMenuInteraction = interaction as StringSelectMenuInteraction;
    if (!selectMenuInteraction) return;
    switch (selectMenuInteraction.customId) {
        case "main-menu":
            await sendSelectMenuForMainMenu(selectMenuInteraction);
            break;
        // case "pokemon-info-menu":
        //     await sendEmbedForPokemonInfo(selectMenuInteraction);
        //     break;
        default:
            logger.error("interaction_handler", `Unknown customId: ${selectMenuInteraction.customId}`);
            return;
    }

}

async function sendSelectMenuForMainMenu(selectMenuInteraction: StringSelectMenuInteraction) {
    const selectedValues = selectMenuInteraction.values;
    switch (selectedValues[0]) {
        // case 'pokemon_info':
        //     await sendPokemonTypeButton(selectMenuInteraction);
        //     break;
        case 'option_2':
            await selectMenuInteraction.reply('選択肢 2 が選ばれました！');
            break;
        default:
            await selectMenuInteraction.reply('不明な選択肢です。');
    }
}
