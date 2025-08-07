import express from "express";
import cors from "cors";
import helmet from "helmet";
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import { config } from "./config/environment";
import { AuthService } from "./services/AuthService";
import { UserService } from "./services/UserService";
import { PostService } from "./services/PostService";
import { FollowService } from "./services/FollowService";
import { createAuthRoutes } from "./routes/auth";
import { createUserRoutes } from "./routes/users";
import { createPostRoutes } from "./routes/posts";
import { createFollowRoutes } from "./routes/follows";
import { injectORM } from "./middleware/orm";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { sanitizeStrings, validateRequestSize } from "./middleware/validation";
import { logger } from "./utils/logger";

async function bootstrap() {
  try {
    logger.info("Starting server initialization...");

    // Initialize database
    logger.info("Initializing database connection...");
    const orm = await MikroORM.init(mikroOrmConfig);
    logger.info("Database connection established successfully");

    // Run migrations
    logger.info("Running database migrations...");
    await orm.getMigrator().up();
    logger.info("Database migrations completed successfully");

    // Create Express app
    const app = express();

    // Security middleware
    app.use(helmet());
    app.use(cors());

    // Request logging middleware
    app.use(requestLogger);

    // Body parsing middleware with size validation
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true, limit: "1mb" }));
    app.use(validateRequestSize(1024)); // 1MB limit

    // Input sanitization
    app.use(sanitizeStrings);

    // Inject ORM into requests
    app.use(injectORM(orm));

    // Create services
    const authService = new AuthService(orm.em.fork());
    const userService = new UserService(orm.em.fork());
    const postService = new PostService(orm.em.fork());
    const followService = new FollowService(orm.em.fork());

    // Routes
    app.use("/api/auth", createAuthRoutes(authService));
    app.use("/api/users", createUserRoutes(userService, postService));
    app.use("/api/posts", createPostRoutes(postService));
    app.use("/api/follows", createFollowRoutes(followService));

    // Health check endpoint
    app.get("/api/health", (_req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // 404 handler for unmatched routes
    app.use("*", notFoundHandler);

    // Global error handler (must be last)
    app.use(errorHandler);

    // Start server
    const port = config.server.port;
    app.listen(port, () => {
      logger.info(`Server started successfully`, {
        port,
        environment: config.server.nodeEnv,
        frontendUrl: config.server.frontendUrl,
      });
    });
  } catch (error) {
    logger.error(
      "Failed to start server",
      error instanceof Error ? error : new Error(String(error)),
      {
        stack: error instanceof Error ? error.stack : undefined,
        message: error instanceof Error ? error.message : String(error),
      }
    );
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  logger.info("Received SIGINT, shutting down gracefully");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error(
    "Unhandled Promise Rejection",
    reason instanceof Error ? reason : new Error(String(reason)),
    {
      promise: promise.toString(),
    }
  );
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", error, {
    stack: error.stack,
    message: error.message,
  });
  process.exit(1);
});

// Start the application
bootstrap();
