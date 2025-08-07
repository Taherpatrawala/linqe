"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const postgresql_1 = require("@mikro-orm/postgresql");
const entities_1 = require("./src/entities");
exports.default = (0, core_1.defineConfig)({
    driver: postgresql_1.PostgreSqlDriver,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dbName: process.env.DB_NAME || 'community_platform',
    entities: [entities_1.User, entities_1.Post],
    entitiesTs: ['./src/entities/**/*.ts'],
    migrations: {
        path: './src/migrations',
        pathTs: './src/migrations',
    },
    debug: process.env.NODE_ENV === 'development',
});
//# sourceMappingURL=mikro-orm.config.js.map