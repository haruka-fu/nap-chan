import { VoiceConnection } from '@discordjs/voice';

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
