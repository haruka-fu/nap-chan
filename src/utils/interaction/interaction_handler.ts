import { ChatInputCommandInteraction, Client, Events, Interaction, SelectMenuInteraction } from 'discord.js';
import { client } from "../../main";
import logger from '../logger';
import { ButtonInteraction } from 'discord.js';

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
    const selectMenuInteraction = interaction as SelectMenuInteraction;
    if (!selectMenuInteraction) return;
    if (selectMenuInteraction.customId !== "single-select") return;
    const selectedValues = selectMenuInteraction.values;
    switch (selectedValues[0]) {
        case 'option_1':
            await selectMenuInteraction.reply('選択肢 1 が選ばれました！');
            break;
        case 'option_2':
            await selectMenuInteraction.reply('選択肢 2 が選ばれました！');
            break;
        default:
            await selectMenuInteraction.reply('不明な選択肢です。');
    }
}
