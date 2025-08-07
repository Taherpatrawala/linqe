import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config';

let orm: MikroORM<PostgreSqlDriver> | null = null;

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<MikroORM<PostgreSqlDriver>> {
    if (orm) {
        return orm;
    }

    try {
        orm = await MikroORM.init<PostgreSqlDriver>(config);
        console.log('Database connected successfully');
        return orm;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}

/**
 * Get the current ORM instance
 */
export function getORM(): MikroORM<PostgreSqlDriver> {
    if (!orm) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return orm;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
    if (orm) {
        await orm.close();
        orm = null;
        console.log('Database connection closed');
    }
}

/**
 * Get Entity Manager
 */
export function getEntityManager() {
    return getORM().em;
}