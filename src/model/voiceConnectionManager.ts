import { VoiceConnection } from '@discordjs/voice';

/**
 * ボイスチャンネル接続の管理モジュール。
 * - 接続の設定、取得、クリア
 */

let connection: VoiceConnection | null = null;

export function setConnection(conn: VoiceConnection) {
    connection = conn;
}
export function getConnection(): VoiceConnection | null {
    return connection;
}
export function clearConnection() {
    connection = null;
}
