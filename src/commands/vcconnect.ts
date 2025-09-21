import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { setConnection } from '../voiceConnectionManager';
import { hasVoiceChannelPermissions } from '../utils/permissions';
import logger from '../utils/logger';
import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { monitorVoiceConnection } from '../utils/voiceConnectionMonitor';

export const CommandData = {
    data: new SlashCommandBuilder()
        .setName('vcconnect')
        .setDescription('なっぷちゃんが VC に参加します'),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.isCommand()) {
            logger.error('Error', 'interaction はスラッシュコマンドではありません。');
            return;
        }

        logger.info('System', '/vcconnect が呼び出されました。');
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!(voiceChannel instanceof VoiceChannel)) {
            await interaction.reply({ content: 'ボイスチャンネルに参加していません。', ephemeral: true });
            return;
        }

        logger.info('System', `接続先ボイスチャンネル: ${voiceChannel.name} (ID: ${voiceChannel.id})`);

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
            logger.info('System', 'ボイスチャンネルに接続中...');
            const connection = await connectToVoiceChannel(voiceChannel);
            setConnection(connection);
            await interaction.editReply({ content: `ボイスチャンネル「${voiceChannel.name}」に参加しました！` });
        } catch (error) {
            logger.error('Error', 'ボイスチャンネルへの接続中にエラーが発生しました:', String(error));
            await interaction.editReply({ content: `ボイスチャンネルに参加できませんでした。エラー: ${error}` });
        }
    },
};

export async function connectToVoiceChannel(voiceChannel: VoiceChannel): Promise<VoiceConnection> {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
        selfDeaf: false, // スピーカーミュートを解除
        selfMute: false, // マイクミュートを解除
    });

    // 接続完了を待機
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

    // 接続状態の監視
    monitorVoiceConnection(connection);

    connection.on('error', (error) => {
        logger.error('Error', 'ボイスチャンネル接続エラー:', String(error));
    });

    return connection;
}
