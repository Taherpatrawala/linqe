import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from '../types/errors';
import { logger, LogLevel } from '../utils/logger';
import { config } from '../config/environment';

/**
 * Global error handler middleware
 * This should be the last middleware in the chain
 */
export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // If response was already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(error);
    }

    const requestId = req.headers['x-request-id'] as string || 'unknown';
    const userId = req.user?.id;

    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: any = undefined;

    // Handle known AppError instances
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        code = error.code;
        message = error.message;
        details = error.details;

        // Log operational errors as warnings, programming errors as errors
        if (error.isOperational) {
            logger.logRequest(
                `Operational error: ${message}`,
                LogLevel.WARN,
                requestId,
                req.method,
                req.path,
                userId,
                { code, details }
            );
        } else {
            logger.logRequest(
                `Programming error: ${message}`,
                LogLevel.ERROR,
                requestId,
                req.method,
                req.path,
                userId,
                { code, details },
                error
            );
        }
    } else {
        // Handle unknown errors
        logger.logRequest(
            `Unhandled error: ${error.message}`,
            LogLevel.ERROR,
            requestId,
            req.method,
            req.path,
            userId,
            undefined,
            error
        );

        // In development, show the actual error message
        if (config.isDevelopment) {
            message = error.message;
        }
    }

    // Prepare error response
    const errorResponse: ErrorResponse = {
        error: {
            message,
            code,
            timestamp: new Date().toISOString(),
            path: req.path
        }
    };

    // Include details in development or for validation errors
    if (details && (config.isDevelopment || statusCode === 400)) {
        errorResponse.error.details = details;
    }

    res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper to catch async errors and pass them to error handler
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    const errorResponse: ErrorResponse = {
        error: {
            message: `Route ${req.method} ${req.path} not found`,
            code: 'NOT_FOUND',
            timestamp: new Date().toISOString(),
            path: req.path
        }
    };

    logger.logRequest(
        `Route not found: ${req.method} ${req.path}`,
        LogLevel.WARN,
        req.headers['x-request-id'] as string || 'unknown',
        req.method,
        req.path
    );

    res.status(404).json(errorResponse);
};