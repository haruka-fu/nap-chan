import * as fs from 'fs';
import * as path from 'path';
import logger from '../logger';

const filePath = path.join(__dirname, '../../../json/english_name.json');

export function getPokemonJsonData(): Record<string, string> {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const jsonArray = JSON.parse(data);

        // 配列をオブジェクト形式に変換し、キーと値を小文字化してスペースを削除
        const englishNames = jsonArray.reduce((acc: Record<string, string>, item: { japanese_name: string; english_name: string }) => {
            if (typeof item.japanese_name === 'string' && typeof item.english_name === 'string') {
                const normalizedKey = item.japanese_name.toLowerCase().replace(/\s+/g, '');
                const normalizedValue = item.english_name.toLowerCase().replace(/\s+/g, '');
                acc[normalizedKey] = normalizedValue;
            } else {
            }
            return acc;
        }, {});
        return englishNames;
    } catch (error) {
        logger.error('GetJSON:', String(error));
        return {};
    }
}
