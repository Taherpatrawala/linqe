import { Request, Response, NextFunction } from 'express';
import { MikroORM } from '@mikro-orm/core';

/**
 * Middleware to inject ORM instance into request
 */
export const injectORM = (orm: MikroORM) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        req.orm = orm;
        next();
    };
};