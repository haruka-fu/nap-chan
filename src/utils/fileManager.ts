import fs from 'fs';
import logger from './logger';

export class FileManager {
    /**
     * 指定されたファイルを削除します。
     * @param filePath - 削除対象のファイルパス
     */
    cleanupFile(filePath: string) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                logger.info('FileManager', `一時ファイル削除処理完了: ${filePath}`);
            }
        } catch (error) {
            logger.error('FileManager', `一時ファイル削除エラー:`, error);
        }
    }
}
