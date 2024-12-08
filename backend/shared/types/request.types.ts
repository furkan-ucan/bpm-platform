import { type Request } from 'express';
import { type Types } from 'mongoose';
import { type IUser } from '@/features/auth/models/user.model';

export interface AuthenticatedRequest extends Request {
  user: IUser & {
    _id: Types.ObjectId;
    id: string;
  };
} 