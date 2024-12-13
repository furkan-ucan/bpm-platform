import { type NextFunction, type Request, type Response } from 'express';
import { type Document } from 'mongoose';

import { AuthenticationError } from '@/shared/errors/common/authentication.error.js';
import { type LoginDTO, type RegisterDTO } from '@/shared/types/dtos/auth.dto.js';

import { type IUser } from '../models/user.model.js';
import { type AuthService } from '../services/auth.service.js';
import { type TokenService } from '../services/token.service.js';

export interface AuthenticatedRequest extends Request {
    user: Document<unknown, unknown, IUser> & IUser & { id: string };
}

export class AuthController {
    constructor(
        private readonly tokenService: TokenService,
        private readonly authService: AuthService
    ) { }

    private validateBody<T>(body: unknown): T {
        if (!body || typeof body !== 'object') {
            throw new AuthenticationError('Geçersiz istek gövdesi');
        }
        return body as T;
    }

    private isValidUser(user: unknown): user is Document<unknown, unknown, IUser> & IUser {
        return (
            user !== null &&
            typeof user === 'object' &&
            '_id' in user &&
            'email' in user &&
            'role' in user
        );
    }

    public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const registerDto = this.validateBody<RegisterDTO>(req.body);
            const user = await this.authService.register(registerDto);

            if (!this.isValidUser(user)) {
                throw new AuthenticationError('Geçersiz kullanıcı verisi');
            }

            const accessToken = this.tokenService.generateAccessToken(user);
            const refreshToken = this.tokenService.generateRefreshToken(user);

            res.status(201).json({
                accessToken,
                refreshToken
            });
        } catch (error) {
            next(error instanceof AuthenticationError ? error : new AuthenticationError('Kayıt işlemi başarısız'));
        }
    }

    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginDto = this.validateBody<LoginDTO>(req.body);
            const user = await this.authService.login(loginDto);

            if (!this.isValidUser(user)) {
                throw new AuthenticationError('Geçersiz kullanıcı verisi');
            }

            const accessToken = this.tokenService.generateAccessToken(user);
            const refreshToken = this.tokenService.generateRefreshToken(user);

            res.json({
                accessToken,
                refreshToken
            });
        } catch (error) {
            next(error instanceof AuthenticationError ? error : new AuthenticationError('Giriş işlemi başarısız'));
        }
    }

    public async refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user;
            if (!this.isValidUser(user)) {
                throw new AuthenticationError('Geçersiz kullanıcı verisi');
            }

            const accessToken = this.tokenService.generateAccessToken(user);
            const refreshToken = this.tokenService.generateRefreshToken(user);

            res.json({
                accessToken,
                refreshToken
            });
        } catch (error) {
            next(error instanceof AuthenticationError ? error : new AuthenticationError('Token yenileme başarısız'));
        }
    }

    public async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user;
            if (!this.isValidUser(user)) {
                throw new AuthenticationError('Geçersiz kullanıcı verisi');
            }

            const userId = user._id?.toString() ?? '';
            if (!userId) {
                throw new AuthenticationError('Geçersiz kullanıcı ID');
            }

            await this.authService.logout(userId);

            res.status(200).json({
                success: true,
                message: 'Başarıyla çıkış yapıldı'
            });
        } catch (error) {
            next(error instanceof AuthenticationError ? error : new AuthenticationError('Çıkış işlemi başarısız'));
        }
    }
}