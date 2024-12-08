import { Document } from 'mongoose';
import { IUser } from '@/features/auth/models/user.model';

declare global {
    namespace Express {
        interface Request {
            user?: Document & IUser;
        }
    }
}

export {};
