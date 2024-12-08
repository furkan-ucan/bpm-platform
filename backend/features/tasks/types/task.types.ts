import { Types } from 'mongoose';

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
}

export const TaskStatus = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskPriority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export interface ITask {
    _id: Types.ObjectId;
    processId: Types.ObjectId;
    stepId: string;
    name: string;
    description?: string;
    assignee?: IUser | Types.ObjectId;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date;
    completedAt?: Date;
    createdBy: IUser | Types.ObjectId;
    updatedBy?: IUser | Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
} 