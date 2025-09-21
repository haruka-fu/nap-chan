/**
 * TTS (Text-to-Speech) キューを管理するクラス。
 * - キューへの追加、削除
 * - 再生管理
 * - 一時ファイルのクリーンアップ
 */

import { createAudioPlayer, createAudioResource, AudioPlayerStatus, AudioPlayerError } from '@discordjs/voice';
import logger from '../logger';
import { FileManager } from '../fileManager';

interface TTSQueueItem {
    text: string;
    filePath: string;
}

export class TTSQueue {
    private queue: TTSQueueItem[] = [];
    private isPlaying = false;
    private currentPlayer: any = null;
    private fileManager = new FileManager();

    add(text: string, filePath: string) {
        this.queue.push({ text, filePath });
    }

    clear() {
        if (this.currentPlayer) {
            this.currentPlayer.stop();
        }

        for (const item of this.queue) {
            this.fileManager.cleanupFile(item.filePath);
        }

        this.queue = [];
        this.isPlaying = false;
        logger.info('TTS', `キューをクリアしました`);
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
            logger.info('TTS', `キューが空になりました`);
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

            this.currentPlayer.on(AudioPlayerStatus.Playing, () => { });

            this.currentPlayer.on(AudioPlayerStatus.Idle, () => {
                this.fileManager.cleanupFile(item.filePath);

                setTimeout(() => {
                    this.playNext(connection);
                }, 100);
            });

            this.currentPlayer.on('error', (error: AudioPlayerError) => {
                logger.error('Error', `プレイヤーエラー: ${error.message}`, error);
                this.fileManager.cleanupFile(item.filePath);

                setTimeout(() => {
                    this.playNext(connection);
                }, 100);
            });

            connection.subscribe(this.currentPlayer);
            this.currentPlayer.play(resource);

        } catch (error) {
            logger.error('Error', `再生エラー: ${(error as Error).message}`, error);
            this.fileManager.cleanupFile(item.filePath);

            setTimeout(() => {
                this.playNext(connection);
            }, 100);
        }
    }
}
