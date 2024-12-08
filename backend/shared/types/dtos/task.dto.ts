import { type Types } from 'mongoose';

import { type TaskStatus, type TaskPriority } from '@/features/tasks/types/task.types';

export interface CreateTaskDTO {
    name: string;
    description?: string;
    processId: Types.ObjectId | string;
    stepId: string;
    priority?: TaskPriority;
    assignee?: Types.ObjectId | string;
    dueDate?: Date | string;
    status?: TaskStatus;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}

export interface UpdateTaskDTO {
    name?: string;
    description?: string;
    priority?: TaskPriority;
    assignee?: Types.ObjectId | string;
    dueDate?: Date | string;
}

export interface TaskFilterDTO {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: Types.ObjectId | string;
    processId?: Types.ObjectId | string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

export interface TaskResponseDTO {
    id: string;
    name: string;
    description?: string;
    processId: string;
    stepId: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: {
        id: string;
        name: string;
        email: string;
    };
    dueDate?: Date;
    completedAt?: Date;
    createdBy: {
        id: string;
        name?: string;
        email?: string;
    };
    updatedBy?: {
        id: string;
        name?: string;
        email?: string;
    };
    createdAt: Date;
    updatedAt: Date;
} 