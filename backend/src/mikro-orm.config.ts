import { defineConfig } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { Follow } from "./entities/Follow";

export default defineConfig({
  driver: PostgreSqlDriver,
  host: process.env["DB_HOST"] || "localhost",
  port: parseInt(process.env["DB_PORT"] || "5432"),
  user: process.env["DB_USER"] || "postgres",
  password: process.env["DB_PASSWORD"] || "taher1234",
  dbName: process.env["DB_NAME"] || "cyber_ciaan",
  entities: [User, Post, Follow],
  entitiesTs: ["./src/entities/**/*.ts"],
  migrations: {
    path: "./src/migrations",
    pathTs: "./src/migrations",
  },
  debug: process.env["NODE_ENV"] === "development",
});
