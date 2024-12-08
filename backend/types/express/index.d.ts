import { type Document } from 'mongoose';

import { type IUser } from '@/features/auth/models/user.model';

declare global {
    namespace Express {
        interface Request {
            user?: Document & IUser;
        }
    }
}

export {};
