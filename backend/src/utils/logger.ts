/**
 * Logging utility for error tracking and debugging
 */

export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug'
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: any;
    error?: Error;
    userId?: number;
    requestId?: string;
    path?: string;
    method?: string;
}

export class Logger {
    private static instance: Logger;
    private isDevelopment: boolean;

    private constructor() {
        this.isDevelopment = process.env['NODE_ENV'] === 'development';
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private formatLogEntry(entry: LogEntry): string {
        const { level, message, timestamp, context, error, userId, requestId, path, method } = entry;

        let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

        if (requestId) {
            logMessage += ` | RequestID: ${requestId}`;
        }

        if (userId) {
            logMessage += ` | UserID: ${userId}`;
        }

        if (method && path) {
            logMessage += ` | ${method} ${path}`;
        }

        if (context) {
            logMessage += ` | Context: ${JSON.stringify(context)}`;
        }

        if (error && this.isDevelopment) {
            logMessage += `\nStack: ${error.stack}`;
        }

        return logMessage;
    }

    private log(entry: LogEntry): void {
        const formattedMessage = this.formatLogEntry(entry);

        switch (entry.level) {
            case LogLevel.ERROR:
                console.error(formattedMessage);
                break;
            case LogLevel.WARN:
                console.warn(formattedMessage);
                break;
            case LogLevel.INFO:
                console.info(formattedMessage);
                break;
            case LogLevel.DEBUG:
                if (this.isDevelopment) {
                    console.debug(formattedMessage);
                }
                break;
        }
    }

    public error(message: string, error?: Error, context?: any): void {
        const logEntry: LogEntry = {
            level: LogLevel.ERROR,
            message,
            timestamp: new Date().toISOString(),
            context
        };

        if (error) {
            logEntry.error = error;
        }

        this.log(logEntry);
    }

    public warn(message: string, context?: any): void {
        this.log({
            level: LogLevel.WARN,
            message,
            timestamp: new Date().toISOString(),
            context
        });
    }

    public info(message: string, context?: any): void {
        this.log({
            level: LogLevel.INFO,
            message,
            timestamp: new Date().toISOString(),
            context
        });
    }

    public debug(message: string, context?: any): void {
        this.log({
            level: LogLevel.DEBUG,
            message,
            timestamp: new Date().toISOString(),
            context
        });
    }

    public logRequest(
        message: string,
        level: LogLevel,
        requestId: string,
        method: string,
        path: string,
        userId?: number,
        context?: any,
        error?: Error
    ): void {
        const logEntry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            requestId,
            method,
            path,
            context
        };

        if (userId !== undefined) {
            logEntry.userId = userId;
        }

        if (error) {
            logEntry.error = error;
        }

        this.log(logEntry);
    }
}

// Export singleton instance
export const logger = Logger.getInstance();