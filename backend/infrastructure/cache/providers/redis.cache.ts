import { createClient, type RedisClientType } from "redis";

import { env } from "@/config";
import { TechnicalError } from "@/shared/errors/types";
import { logger } from "@/shared/utils/logger";

export class RedisCache {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: env.redis.url,
      password: env.redis.password,
      database: env.redis.db,
    });

    this.setupEventHandlers();
    this.connect();
  }

  private setupEventHandlers(): void {
    this.client.on("error", (error) => {
      logger.error("Redis error:", error);
      this.isConnected = false;
    });

    this.client.on("connect", () => {
      logger.info("Redis connected");
      this.isConnected = true;
    });

    this.client.on("reconnecting", () => {
      logger.info("Redis reconnecting");
    });
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error("Redis connection error:", error);
      throw new TechnicalError("Redis connection failed");
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error("Redis get error:", { error, key });
      throw new TechnicalError("Cache read operation failed");
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error("Redis set error:", { error, key });
      throw new TechnicalError("Cache write operation failed");
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error("Redis delete error:", { error, key });
      throw new TechnicalError("Cache delete operation failed");
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushDb();
    } catch (error) {
      logger.error("Redis flush error:", error);
      throw new TechnicalError("Cache flush operation failed");
    }
  }
}

// Singleton instance
export const redisCache = new RedisCache();
