import { Types } from 'mongoose';
import { ITask } from '@/features/tasks/types/task.types';
import { CreateTaskDTO, UpdateTaskDTO, TaskFilterDTO } from '@/shared/types/dtos/task.dto';

export interface ITaskRepository {
    create(data: CreateTaskDTO, userId: Types.ObjectId): Promise<ITask>;
    findById(id: string): Promise<ITask | null>;
    findAll(filters: TaskFilterDTO): Promise<{ tasks: ITask[], total: number }>;
    update(id: string, data: UpdateTaskDTO, userId: Types.ObjectId): Promise<ITask>;
    delete(id: string): Promise<void>;
    findByProcessId(processId: string): Promise<ITask[]>;
    updateStatus(id: string, status: string, userId: Types.ObjectId): Promise<ITask>;
} 