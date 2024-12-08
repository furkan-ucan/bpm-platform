export class AppError extends Error {
    constructor(public message: string, public statusCode: number) {
        super(message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(message, 401);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Kaynak bulunamadı') {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Geçersiz veri') {
        super(message, 400);
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Kimlik doğrulama hatası') {
        super(message, 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Yetkisiz erişim') {
        super(message, 403);
    }
} 