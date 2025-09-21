import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { setConnection } from '../voiceConnectionManager';
import { hasVoiceChannelPermissions } from '../utils/permissions';
import { connectToVoiceChannel } from '../utils/voiceConnection';

export const CommandData = {
    data: new SlashCommandBuilder()
        .setName('vcjoin')
        .setDescription('なっぷちゃんが VC に参加します'),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.isCommand()) {
            console.log("[Error] interaction はスラッシュコマンドではありません。");
            return;
        }

        console.log("[System] /vcjoin が呼び出されました。");
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!(voiceChannel instanceof VoiceChannel)) {
            await interaction.reply({ content: 'ボイスチャンネルに参加していません。', ephemeral: true });
            return;
        }

        console.log(`[System] 接続先ボイスチャンネル: ${voiceChannel.name} (ID: ${voiceChannel.id})`);

        // 権限確認
        if (!hasVoiceChannelPermissions(voiceChannel, interaction.guild?.members.me!)) {
            await interaction.reply({
                content: '[Error] ボイスチャンネルに参加する権限がありません。「接続」と「発言」の権限を付与してください。',
                ephemeral: true
            });
            return;
        }

        await interaction.deferReply();

        try {
            console.log(`[System] ボイスチャンネルに接続中...`);
            const connection = await connectToVoiceChannel(voiceChannel);
            setConnection(connection);
            await interaction.editReply({ content: `ボイスチャンネル「${voiceChannel.name}」に参加しました！` });
        } catch (error) {
            console.error(`[Error] ボイスチャンネルへの接続中にエラーが発生しました:`, error);
            await interaction.editReply({ content: `ボイスチャンネルに参加できませんでした。エラー: ${error}` });
        }
    },
};
