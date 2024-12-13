import {
  type Model,
  type Document,
  type FilterQuery,
  type UpdateQuery,
  type QueryOptions,
} from "mongoose";

import logger from "@/monitoring/logging/providers/winston.logger";
import { TechnicalError } from "@/shared/errors/common/technical.error";
import { NotFoundError } from "@/shared/errors/common/not-found.error";
import { ValidationError } from "@/shared/errors/common/validation.error";

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) { }

  protected async executeQuery<TResult>(
    operation: () => Promise<TResult>,
    errorContext: { method: string; id?: string }
  ): Promise<TResult> {
    try {
      return await operation();
    } catch (error: any) {
      logger.error("Repository error:", {
        ...errorContext,
        error: error.message,
        stack: error.stack,
      });

      if (error.name === "CastError") {
        throw new ValidationError("Invalid ID format");
      }
      if (error.name === "ValidationError") {
        throw new ValidationError(error.message);
      }
      throw new TechnicalError("Database operation failed");
    }
  }

  async findById(id: string, options: QueryOptions = {}): Promise<T | null> {
    try {
      return await this.model.findById(id);
    } catch (error: any) {
      logger.error("Repository error:", { error, method: "findById" });
      if (error.name === "CastError") {
        throw new ValidationError("Geçersiz ID formatı");
      }
      throw error;
    }
  }

  async findOne(
    filter: FilterQuery<T>,
    options: QueryOptions = {}
  ): Promise<T | null> {
    return await this.executeQuery(
      () => this.model.findOne(filter, null, options).exec(),
      { method: "findOne" }
    );
  }

  async find(
    filter: FilterQuery<T> = {},
    options: QueryOptions = {}
  ): Promise<{ items: T[]; total: number }> {
    return await this.executeQuery(
      async () => {
        const [items, total] = await Promise.all([
          this.model.find(filter, null, options).exec(),
          this.model.countDocuments(filter),
        ]);
        return { items, total };
      },
      { method: "find" }
    );
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.executeQuery(() => this.model.create(data), {
      method: "create",
    });
  }

  async update(
    id: string,
    data: UpdateQuery<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const updated = await this.executeQuery(
      () =>
        this.model
          .findByIdAndUpdate(id, data, { ...options, new: true })
          .exec(),
      { method: "update", id }
    );

    if (!updated) {
      throw new NotFoundError(`Entity with id ${id} not found`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.executeQuery(
      async () => {
        const result = await this.model.findByIdAndDelete(id).exec();
        if (!result) {
          throw new NotFoundError(`Entity with id ${id} not found`);
        }
      },
      { method: "delete", id }
    );
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    return await this.executeQuery(
      () => this.model.exists(filter).then((result) => !!result),
      { method: "exists" }
    );
  }
}
