import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
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

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            setConnection(connection);
            await interaction.reply({ content: `ボイスチャンネル「${voiceChannel.name}」に参加しました！` });
        } catch (error) {
            console.error('Error joining voice channel:', error);
            await interaction.reply({ content: 'ボイスチャンネルに参加できませんでした。', ephemeral: true });
        }
    },
};
