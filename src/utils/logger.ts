import winston from 'winston';
import { format } from 'date-fns';
import { TransformableInfo } from 'logform';

// Generate log file names based on the current date
const currentDate = format(new Date(), 'yyyy-MM-dd');

// Winston logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // 日本時間の24時間表記にフォーマット
        winston.format.printf((info: TransformableInfo) => {
            const { timestamp, level, message } = info;
            return `${timestamp || ''} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: `logs/error-${currentDate}.log`, level: 'warn' }),
        new winston.transports.File({ filename: `logs/logger-${currentDate}.log` })
    ]
});

// Enhanced logging function
function log(level: 'info' | 'warn' | 'error', context: string, message: string, error?: any) {
    const formattedMessage = `[${context}] ${message}`;
    if (error) {
        logger[level](formattedMessage, { error });
    } else {
        logger[level](formattedMessage);
    }
}

export default {
    info: (context: string, message: string) => log('info', context, message),
    warn: (context: string, message: string) => log('warn', context, message),
    error: (context: string, message: string, error?: any) => log('error', context, message, error)
};
