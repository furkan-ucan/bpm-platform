import { Request, Response, NextFunction } from 'express';
import { Document, Types } from 'mongoose';
import { AuthService } from '../services/auth.service';
import { LoginDTO, RegisterDTO } from '@/shared/types/dtos/auth.dto';
import { ValidationError } from '@/shared/errors/types/app-error';
import { IUser } from '../models/user.model';

interface AuthenticatedRequest extends Request {
    user: Document & IUser & {
        _id: Types.ObjectId;
    };
}

export class AuthController {
    constructor(private authService: AuthService) {}

    public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: RegisterDTO = req.body;
            const result = await this.authService.register(userData);
            
            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const credentials: LoginDTO = req.body;
            const result = await this.authService.login(credentials);
            
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refreshToken } = req.body;
            const result = await this.authService.refreshToken(refreshToken);
            
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public logout = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = (req as AuthenticatedRequest).user._id.toString();
            await this.authService.logout(userId);
            
            res.status(200).json({
                status: 'success',
                message: 'Başarıyla çıkış yapıldı'
            });
        } catch (error) {
            next(error);
        }
    };
} 