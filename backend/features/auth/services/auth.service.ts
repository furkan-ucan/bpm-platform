import { type Model } from 'mongoose';

import { AuthenticationError } from '@/shared/errors/common/authentication.error';
import { type LoginDTO, type RegisterDTO } from '@/shared/types/dtos/auth.dto';
import { type TokenResponse, type UserResponse } from '@/shared/types/responses/token.response';

import { type TokenService } from './token.service';
import { type IUser } from '../models/user.model';

const LOGIN_ATTEMPTS_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;

export class AuthService {
    #userModel: Model<IUser>;
    #tokenService: TokenService;

    constructor(userModel: Model<IUser>, tokenService: TokenService) {
        this.#userModel = userModel;
        this.#tokenService = tokenService;
    }

    public async register(registerDto: RegisterDTO): Promise<TokenResponse> {
        const existingUser = await this.#userModel
            .findOne({ email: registerDto.email.toLowerCase() })
            .exec();

        if (existingUser) {
            throw new AuthenticationError('Bu e-posta adresi zaten kullanımda');
        }

        const user = await this.#userModel.create({
            ...registerDto,
            email: registerDto.email.toLowerCase()
        });

        return await this.generateTokenResponse(user);
    }

    public async login(loginDto: LoginDTO): Promise<TokenResponse> {
        const user = await this.#userModel
            .findOne({ email: loginDto.email.toLowerCase() })
            .select('+password')
            .exec();

        if (!user) {
            throw new AuthenticationError('Geçersiz e-posta veya şifre');
        }

        this.validateUserStatus(user);
        await this.validateLoginAttempts(user);
        await this.validatePassword(user, loginDto.password);

        // Başarılı giriş
        user.loginAttempts = 0;
        user.lastLogin = new Date();
        await user.save();

        return await this.generateTokenResponse(user);
    }

    public async refreshTokens(refreshToken: string): Promise<TokenResponse> {
        const payload = this.#tokenService.verifyRefreshToken(refreshToken);

        const user = await this.#userModel
            .findById(payload.userId)
            .exec();

        if (!user) {
            throw new AuthenticationError('Kullanıcı bulunamadı');
        }

        this.validateUserStatus(user);
        await this.#tokenService.revokeToken(refreshToken);

        return await this.generateTokenResponse(user);
    }

    public async logout(refreshToken: string): Promise<void> {
        await this.#tokenService.revokeToken(refreshToken);
    }

    private validateUserStatus(user: IUser): void {
        if (!user.isActive) {
            throw new AuthenticationError('Hesabınız devre dışı bırakılmış');
        }
    }

    private async validateLoginAttempts(user: IUser): Promise<void> {
        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lastAttemptTime = user.lastLogin || new Date(0);
            const timeSinceLastAttempt = Date.now() - lastAttemptTime.getTime();

            if (timeSinceLastAttempt < LOGIN_ATTEMPTS_WINDOW) {
                throw new AuthenticationError('Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin');
            }

            user.loginAttempts = 0;
            await user.save();
        }
    }

    private async validatePassword(user: IUser, password: string): Promise<void> {
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            user.loginAttempts += 1;
            await user.save();
            throw new AuthenticationError('Geçersiz e-posta veya şifre');
        }
    }

    private async generateTokenResponse(user: IUser): Promise<TokenResponse> {
        const [accessToken, refreshToken] = await Promise.all([
            this.#tokenService.generateAccessToken(user),
            this.#tokenService.generateRefreshToken(user)
        ]);

        const userResponse: UserResponse = {
            id: user._id?.toString() ?? '',
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        };

        return {
            accessToken,
            refreshToken,
            user: userResponse
        };
    }
}