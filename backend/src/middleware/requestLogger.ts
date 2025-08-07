import { Request, Response, NextFunction } from 'express';
import { logger, LogLevel } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request logging middleware
 * Logs incoming requests and their responses
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || uuidv4();

    // Add request ID to request headers for downstream use
    req.headers['x-request-id'] = requestId;

    // Log incoming request
    logger.logRequest(
        `Incoming request`,
        LogLevel.INFO,
        requestId,
        req.method,
        req.path,
        req.user?.id,
        {
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            query: Object.keys(req.query).length > 0 ? req.query : undefined,
            bodySize: req.headers['content-length'] ? `${req.headers['content-length']} bytes` : undefined
        }
    );

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function (body: any) {
        const duration = Date.now() - startTime;

        // Log response
        logger.logRequest(
            `Request completed`,
            res.statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO,
            requestId,
            req.method,
            req.path,
            req.user?.id,
            {
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                responseSize: body ? `${JSON.stringify(body).length} chars` : undefined
            }
        );

        return originalJson.call(this, body);
    };

    next();
};