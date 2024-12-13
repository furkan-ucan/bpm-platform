export interface ErrorContext {
    requestId: string;
    userId?: string;
    timestamp: Date;
    path: string;
    method: string;
    correlationId?: string;
    metadata?: Record<string, any>;
}

export class ErrorContextBuilder {
    private context: Partial<ErrorContext> = {};

    setRequestId(id: string): this {
        this.context.requestId = id;
        return this;
    }

    setUserId(id?: string): this {
        if (id) {
            this.context.userId = id;
        }
        return this;
    }

    setPath(path: string): this {
        this.context.path = path;
        return this;
    }

    setMethod(method: string): this {
        this.context.method = method;
        return this;
    }

    setCorrelationId(id: string): this {
        this.context.correlationId = id;
        return this;
    }

    setMetadata(metadata: Record<string, any>): this {
        this.context.metadata = metadata;
        return this;
    }

    build(): ErrorContext {
        return {
            timestamp: new Date(),
            ...this.context
        } as ErrorContext;
    }
} 