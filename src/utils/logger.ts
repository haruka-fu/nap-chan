import winston from 'winston';
import { format } from 'date-fns';
import { TransformableInfo } from 'logform';

// Generate log file names based on the current date
const currentDate = format(new Date(), 'yyyy-MM-dd');

// Winston logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info: TransformableInfo) => {
            const { timestamp, level, message } = info;
            return `${timestamp || ''} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: `logs/error-${currentDate}.log`, level: 'error' }),
        new winston.transports.File({ filename: `logs/combined-${currentDate}.log` })
    ]
});

// 使用例:
// logger.info('これは情報ログです');
// logger.error('これはエラーログです');
// logger.warn('これは警告ログです');

export default logger;
