import { initializeDatabase, closeDatabase } from '../config/database';
import { DatabaseUtils } from '../utils/database';

async function seed() {
    try {
        console.log('Initializing database connection...');
        await initializeDatabase();

        console.log('Running migrations...');
        await DatabaseUtils.runMigrations();

        console.log('Seeding database...');
        await DatabaseUtils.seedDatabase();

        console.log('Seed completed successfully!');
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    } finally {
        await closeDatabase();
    }
}

seed();