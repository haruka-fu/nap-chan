import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { joinVoiceChannel, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { setConnection } from '../voiceConnectionManager';

export const CommandData = {
    data: new SlashCommandBuilder()
        .setName('vcjoin')
        .setDescription('なっぷちゃんが VC に参加します'),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.isCommand()) {
            console.log("interaction はスラッシュコマンドではありません。");
            return;
        }

        console.log("/vcjoin が呼び出されました。");
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            await interaction.reply({ content: 'ボイスチャンネルに参加していません。', ephemeral: true });
            return;
        }

        console.log(`接続先ボイスチャンネル: ${voiceChannel.name} (ID: ${voiceChannel.id})`);
        console.log(`ギルドID: ${voiceChannel.guild.id}`);
        console.log(`ボット権限確認中...`);

        // 権限確認
        const permissions = voiceChannel.permissionsFor(interaction.guild?.members.me!);
        if (!permissions?.has(['Connect', 'Speak'])) {
            await interaction.reply({
                content: 'ボイスチャンネルに参加する権限がありません。「接続」と「発言」の権限を付与してください。',
                ephemeral: true
            });
            return;
        }

        await interaction.deferReply();

        try {
            console.log('ボイスチャンネルに接続中...');
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
                selfDeaf: false, // スピーカーミュートを解除
                selfMute: false, // マイクミュートを解除
            });

            console.log('接続オブジェクトが作成されました');

            // 接続状態の監視
            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('ボイスチャンネル接続が完了しました');
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                console.log('ボイスチャンネルから切断されました');
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                    console.log('再接続に成功しました');
                } catch (error) {
                    console.error('再接続に失敗しました:', error);
                    connection.destroy(); // リソースを解放
                }
            });

            connection.on('error', (error) => {
                console.error('ボイスチャンネル接続エラー:', error);
                if (error.code === 'ERR_SOCKET_DGRAM_NOT_RUNNING') {
                    console.log('UDPソケットが停止しています。接続を再試行します。');
                    connection.destroy(); // リソースを解放
                }
            });

            setConnection(connection);

            // 接続完了を待機
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
                await interaction.editReply({ content: `ボイスチャンネル「${voiceChannel.name}」に参加しました！` });
            } catch (error) {
                console.error('接続タイムアウト:', error);
                await interaction.editReply({ content: 'ボイスチャンネルへの接続がタイムアウトしました。再度お試しください。' });
            }

        } catch (error) {
            console.error('Error joining voice channel:', error);
            await interaction.editReply({ content: `ボイスチャンネルに参加できませんでした。エラー: ${error}` });
        }
    },
};
