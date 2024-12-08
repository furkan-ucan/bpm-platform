import jwt from 'jsonwebtoken';
import { type Document } from 'mongoose';

import { env } from '@/config/index.js';
import { AuthenticationError } from '@/shared/errors/types/app-error.js';

import { type IUser } from '../models/user.model.js';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export class TokenService {
    readonly #accessTokenSecret: string;
    readonly #refreshTokenSecret: string;
    readonly #accessTokenExpiry: string;
    readonly #refreshTokenExpiry: string;

    constructor() {
        const secret = env.jwt.secret;
        if (typeof secret !== 'string' || secret.length < 32) {
            throw new Error('JWT secret must be at least 32 characters long');
        }

        this.#accessTokenSecret = secret;
        this.#refreshTokenSecret = `${secret}_refresh`;
        this.#accessTokenExpiry = env.jwt.expiresIn ?? '15m';
        this.#refreshTokenExpiry = '7d';
    }

    public generateAccessToken(user: IUser & Document): string {
        if (!user._id || !user.email || !user.role) {
            throw new AuthenticationError('Eksik kullanıcı bilgileri');
        }

        const payload: TokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        };

        try {
            return jwt.sign(payload, this.#accessTokenSecret, {
                expiresIn: this.#accessTokenExpiry,
                algorithm: 'HS512'
            });
        } catch (_error) {
            throw new AuthenticationError('Access token oluşturulamadı');
        }
    }

    public generateRefreshToken(user: IUser & Document): string {
        if (!user._id || !user.email || !user.role) {
            throw new AuthenticationError('Eksik kullanıcı bilgileri');
        }

        const payload: TokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        };

        try {
            return jwt.sign(payload, this.#refreshTokenSecret, {
                expiresIn: this.#refreshTokenExpiry,
                algorithm: 'HS512'
            });
        } catch (_error) {
            throw new AuthenticationError('Refresh token oluşturulamadı');
        }
    }

    public verifyAccessToken(token: string): TokenPayload {
        if (!token) {
            throw new AuthenticationError('Token bulunamadı');
        }

        try {
            const decoded = jwt.verify(token, this.#accessTokenSecret, {
                algorithms: ['HS512']
            });

            if (typeof decoded !== 'object' || !decoded.userId || !decoded.email || !decoded.role) {
                throw new AuthenticationError('Geçersiz token yapısı');
            }

            return decoded as TokenPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthenticationError('Token süresi doldu');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AuthenticationError('Geçersiz token');
            }
            throw new AuthenticationError('Token doğrulama hatası');
        }
    }

    public verifyRefreshToken(token: string): TokenPayload {
        if (!token) {
            throw new AuthenticationError('Refresh token bulunamadı');
        }

        try {
            const decoded = jwt.verify(token, this.#refreshTokenSecret, {
                algorithms: ['HS512']
            });

            if (typeof decoded !== 'object' || !decoded.userId || !decoded.email || !decoded.role) {
                throw new AuthenticationError('Geçersiz refresh token yapısı');
            }

            return decoded as TokenPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthenticationError('Refresh token süresi doldu');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AuthenticationError('Geçersiz refresh token');
            }
            throw new AuthenticationError('Refresh token doğrulama hatası');
        }
    }

    public async revokeToken(token: string): Promise<void> {
        if (!token) {
            throw new AuthenticationError('Geçersiz token');
        }
        // TODO: Implement token revocation logic
        // 1. Add token to blacklist in Redis
        // 2. Set expiration for blacklisted token
        await Promise.resolve();
    }
}
