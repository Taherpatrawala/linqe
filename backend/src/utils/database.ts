import { getEntityManager, getORM } from '../config/database';
import { User, Post } from '../entities';

/**
 * Database utility functions for common operations
 */
export class DatabaseUtils {
    /**
     * Check if database connection is healthy
     */
    static async checkConnection(): Promise<boolean> {
        try {
            const em = getEntityManager();
            await em.getConnection().execute('SELECT 1');
            return true;
        } catch (error) {
            console.error('Database connection check failed:', error);
            return false;
        }
    }

    /**
     * Run database migrations
     */
    static async runMigrations(): Promise<void> {
        try {
            const orm = getORM();
            const migrator = orm.getMigrator();
            await migrator.up();
            console.log('Migrations completed successfully');
        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }

    /**
     * Create database schema (for development)
     */
    static async createSchema(): Promise<void> {
        try {
            const orm = getORM();
            const generator = orm.getSchemaGenerator();
            await generator.createSchema();
            console.log('Database schema created successfully');
        } catch (error) {
            console.error('Schema creation failed:', error);
            throw error;
        }
    }

    /**
     * Drop database schema (for development)
     */
    static async dropSchema(): Promise<void> {
        try {
            const orm = getORM();
            const generator = orm.getSchemaGenerator();
            await generator.dropSchema();
            console.log('Database schema dropped successfully');
        } catch (error) {
            console.error('Schema drop failed:', error);
            throw error;
        }
    }

    /**
     * Seed database with initial data (for development)
     */
    static async seedDatabase(): Promise<void> {
        try {
            const em = getEntityManager();

            // Check if users already exist
            const userCount = await em.count(User);
            if (userCount > 0) {
                console.log('Database already seeded');
                return;
            }

            // Create sample users
            const user1 = new User(
                'john.doe@example.com',
                'John Doe',
                'password123',
                'Software developer passionate about building great applications.'
            );

            const user2 = new User(
                'jane.smith@example.com',
                'Jane Smith',
                'password123',
                'Product manager with a love for user experience design.'
            );

            await em.persistAndFlush([user1, user2]);

            // Create sample posts
            const post1 = new Post(
                'Welcome to our community platform! Excited to share ideas and connect with everyone.',
                user1
            );

            const post2 = new Post(
                'Just finished reading a great book on software architecture. Highly recommend it!',
                user1
            );

            const post3 = new Post(
                'Looking forward to collaborating on some exciting projects this year.',
                user2
            );

            await em.persistAndFlush([post1, post2, post3]);

            console.log('Database seeded successfully');
        } catch (error) {
            console.error('Database seeding failed:', error);
            throw error;
        }
    }
}