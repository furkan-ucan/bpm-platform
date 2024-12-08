import { User } from '../models/user.model';
import { LoginDTO, RegisterDTO, TokenDTO } from '@/shared/types/dtos/auth.dto';
import { AuthenticationError, ValidationError } from '@/shared/errors/types/app-error';
import { generateToken, verifyToken } from '@/security/authentication/providers/jwt.provider';
import { env } from '@/config';

export class AuthService {
    public async register(userData: RegisterDTO): Promise<{ user: any; tokens: TokenDTO }> {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new ValidationError('Bu email adresi zaten kullanımda');
        }

        const user = new User(userData);
        await user.save();

        const tokens = await this.generateAuthTokens(user.id);

        return {
            user: user.toJSON(),
            tokens
        };
    }

    public async login(credentials: LoginDTO): Promise<{ user: any; tokens: TokenDTO }> {
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
            throw new AuthenticationError('Geçersiz email veya şifre');
        }

        const isPasswordValid = await user.comparePassword(credentials.password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Geçersiz email veya şifre');
        }

        const tokens = await this.generateAuthTokens(user.id);

        return {
            user: user.toJSON(),
            tokens
        };
    }

    public async refreshToken(refreshToken: string): Promise<TokenDTO> {
        try {
            const decoded = await verifyToken(refreshToken, 'refresh');
            return await this.generateAuthTokens(decoded.userId);
        } catch (error) {
            throw new AuthenticationError('Geçersiz veya süresi dolmuş token');
        }
    }

    public async logout(userId: string): Promise<void> {
        // İleride redis ile token blacklist yapılabilir
        return;
    }

    private async generateAuthTokens(userId: string): Promise<TokenDTO> {
        const accessToken = await generateToken({ userId }, 'access');
        const refreshToken = await generateToken({ userId }, 'refresh');

        return {
            accessToken,
            refreshToken,
            expiresIn: parseInt(env.jwt.expiresIn)
        };
    }
} 