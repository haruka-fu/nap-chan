/**
 * コマンドの型定義。
 * - Discord.js の SlashCommandBuilder を使用
 * - 各コマンドの実行ロジックを定義
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
