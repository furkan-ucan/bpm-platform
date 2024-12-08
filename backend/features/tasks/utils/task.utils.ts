import { type Types } from 'mongoose';

import { type TaskResponseDTO } from '@/shared/types/dtos/task.dto';

import { type ITask, type IUser } from '../types/task.types';

const isUser = (value: IUser | Types.ObjectId): value is IUser => {
    return (value as IUser).name !== undefined;
};

export const convertTaskToDTO = (task: ITask): TaskResponseDTO => ({
    id: task._id.toString(),
    processId: task.processId.toString(),
    stepId: task.stepId.toString(),
    name: task.name,
    description: task.description,
    assignee: task.assignee && isUser(task.assignee) ? {
        id: task.assignee._id.toString(),
        name: task.assignee.name,
        email: task.assignee.email
    } : undefined,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    createdBy: isUser(task.createdBy) ? {
        id: task.createdBy._id.toString(),
        name: task.createdBy.name,
        email: task.createdBy.email
    } : { id: task.createdBy.toString() },
    updatedBy: task.updatedBy && isUser(task.updatedBy) ? {
        id: task.updatedBy._id.toString(),
        name: task.updatedBy.name,
        email: task.updatedBy.email
    } : task.updatedBy ? { id: task.updatedBy.toString() } : undefined,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
}); 