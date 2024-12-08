export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
  }
}

export class TechnicalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TechnicalError';
  }
} 