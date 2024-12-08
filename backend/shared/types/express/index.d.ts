import { type IUser } from '@/features/auth/models/user.model';

declare global {
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Request {
            user?: IUser & { id: string };
        }
    }
}

export {};