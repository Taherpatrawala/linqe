/**
 * Environment configuration
 */
export const config = {
    // Database
    database: {
        host: process.env['DB_HOST'] || 'localhost',
        port: parseInt(process.env['DB_PORT'] || '5432'),
        name: process.env['DB_NAME'] || 'linqe_db',
        user: process.env['DB_USER'] || 'postgres',
        password: process.env['DB_PASSWORD'] || 'password',
        url: process.env['DATABASE_URL'],
    },

    // JWT
    jwt: {
        secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-this-in-production',
        expiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
    },

    // Server
    server: {
        port: parseInt(process.env['PORT'] || '3001'),
        nodeEnv: process.env['NODE_ENV'] || 'development',
        frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:3000',
    },

    // Security
    security: {
        bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12'),
    },

    // Development flags
    isDevelopment: process.env['NODE_ENV'] === 'development',
    isProduction: process.env['NODE_ENV'] === 'production',
    isTest: process.env['NODE_ENV'] === 'test',
};