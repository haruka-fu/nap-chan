/**
 * TTS (Text-to-Speech) キューを管理するクラス。
 * - キューへの追加、削除
 * - 再生管理
 * - 一時ファイルのクリーンアップ
 */

import { createAudioPlayer, createAudioResource, AudioPlayerStatus, AudioPlayerError } from '@discordjs/voice';
import fs from 'fs';

interface TTSQueueItem {
    text: string;
    filePath: string;
}

class TTSQueue {
    private queue: TTSQueueItem[] = [];
    private isPlaying = false;
    private currentPlayer: any = null;

    add(text: string, filePath: string) {
        this.queue.push({ text, filePath });
    }

    clear() {
        // 現在のプレイヤーを停止
        if (this.currentPlayer) {
            this.currentPlayer.stop();
        }

        // キューの全ファイルを削除
        for (const item of this.queue) {
            this.cleanupFile(item.filePath);
        }

        this.queue = [];
        this.isPlaying = false;
        console.log(`[TTS] キューをクリアしました`);
    }

    getSize(): number {
        return this.queue.length;
    }

    isCurrentlyPlaying(): boolean {
        return this.isPlaying;
    }

    async startPlayback(connection: any) {
        if (!this.isPlaying) {
            this.playNext(connection);
        }
    }

    private async playNext(connection: any) {
        if (this.queue.length === 0) {
            this.isPlaying = false;
            console.log(`[TTS] キューが空になりました`);
            return;
        }

        this.isPlaying = true;
        const item = this.queue.shift()!;

        try {
            if (this.currentPlayer) {
                this.currentPlayer.stop();
            }

            this.currentPlayer = createAudioPlayer();
            const resource = createAudioResource(item.filePath);

            this.currentPlayer.on(AudioPlayerStatus.Playing, () => {
            });

            this.currentPlayer.on(AudioPlayerStatus.Idle, () => {
                this.cleanupFile(item.filePath);

                setTimeout(() => {
                    this.playNext(connection);
                }, 100);
            });

            this.currentPlayer.on('error', (error: AudioPlayerError) => {
                console.error(`[Error] プレイヤーエラー: ${error.message}`, error);
                this.cleanupFile(item.filePath);

                setTimeout(() => {
                    this.playNext(connection);
                }, 100);
            });

            connection.subscribe(this.currentPlayer);
            this.currentPlayer.play(resource);

        } catch (error) {
            console.error(`[Error] 再生エラー: ${(error as Error).message}`, error);
            this.cleanupFile(item.filePath);

            setTimeout(() => {
                this.playNext(connection);
            }, 100);
        }
    }

    private cleanupFile(filePath: string) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`[TTS] 一時ファイル削除処理完了: ${filePath}`);
            }
        } catch (error) {
            console.error(`[Error] 一時ファイル削除エラー:`, error);
        }
    }
}

// シングルトンインスタンス
export const ttsQueue = new TTSQueue();
