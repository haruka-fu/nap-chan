import { GuildMember, PermissionsBitField, VoiceChannel } from 'discord.js';

/**
 * ボイスチャンネルの権限を確認します。
 * @param voiceChannel - チェック対象のボイスチャンネル
 * @param member - ボットのギルドメンバー情報
 * @returns 権限が十分であれば true、不足していれば false
 */
export function hasVoiceChannelPermissions(voiceChannel: VoiceChannel, member: GuildMember): boolean {
    const permissions = voiceChannel.permissionsFor(member);
    if (!permissions) return false;

    // 必要な権限を確認
    return permissions.has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak]);
}
