import { Model, Types } from 'mongoose';
import { ITaskRepository } from '@/shared/interfaces/repositories/ITaskRepository';
import { Task } from '@/features/tasks/models/task.model';
import { ITask } from '@/features/tasks/types/task.types';
import { CreateTaskDTO, UpdateTaskDTO, TaskFilterDTO } from '@/shared/types/dtos/task.dto';
import { NotFoundError } from '@/shared/errors/types/app-error';
import { ValidationError } from '@/shared/errors/types/validation-error';
import { logger } from '@/shared/utils/logger';

export class TaskRepository implements ITaskRepository {
    private model: Model<ITask>;

    constructor() {
        this.model = Task;
    }

    async create(data: CreateTaskDTO, userId: Types.ObjectId): Promise<ITask> {
        const task = new this.model({
            ...data,
            createdBy: userId,
            updatedBy: userId
        });
        
        await task.validate();
        return await task.save();
    }

    async findById(id: string): Promise<ITask | null> {
        try {
            const task = await this.model.findById(id)
                .populate('assignee', 'name email')
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');

            if (!task) {
                throw new NotFoundError(`${id} ID'li görev bulunamadı`);
            }
            return task;
        } catch (error: any) {
            logger.error('Repository error:', { 
                error, 
                method: 'findById',
                taskId: id,
                errorName: error.name 
            });
            
            if (error.name === 'CastError') {
                throw new ValidationError('Geçersiz ID formatı');
            }
            throw error;
        }
    }

    async findAll(filters: TaskFilterDTO): Promise<{ tasks: ITask[], total: number }> {
        const query = this.buildFilterQuery(filters);
        const total = await this.model.countDocuments(query);
        const tasks = await this.model.find(query)
            .populate('assignee', 'name email')
            .skip((filters.page || 0) * (filters.limit || 10))
            .limit(filters.limit || 10)
            .sort({ createdAt: -1 });

        return { tasks, total };
    }

    async update(id: string, data: UpdateTaskDTO, userId: Types.ObjectId): Promise<ITask> {
        try {
            const task = await this.model.findByIdAndUpdate(
                id,
                {
                    ...data,
                    updatedBy: userId
                },
                { new: true }
            )
            .populate('assignee', 'name email')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
    
            if (!task) {
                throw new NotFoundError(`${id} ID'li görev bulunamadı`);
            }
    
            return task;
        } catch (error: any) {
            logger.error('Repository error:', { 
                error, 
                method: 'update',
                taskId: id,
                userId: userId.toString() 
            });
            
            if (error.name === 'CastError') {
                throw new ValidationError('Geçersiz ID formatı');
            }
            throw error;
        }
    }

    async updateStatus(id: string, status: string, userId: Types.ObjectId): Promise<ITask> {
        const task = await this.model.findByIdAndUpdate(
            id,
            { 
                status,
                updatedBy: userId,
                ...(status === 'completed' ? { completedAt: new Date() } : {})
            },
            { new: true }
        ).populate('assignee', 'name email');

        if (!task) {
            throw new NotFoundError(`${id} ID'li görev bulunamadı`);
        }

        return task;
    }

    private buildFilterQuery(filters: TaskFilterDTO): any {
        const query: any = {};

        if (filters.status) query.status = filters.status;
        if (filters.assignee) query.assignee = filters.assignee;
        if (filters.processId) query.processId = filters.processId;
        if (filters.priority) query.priority = filters.priority;

        if (filters.fromDate || filters.toDate) {
            query.createdAt = {};
            if (filters.fromDate) {
                query.createdAt.$gte = new Date(filters.fromDate);
            }
            if (filters.toDate) {
                query.createdAt.$lte = new Date(filters.toDate);
            }
        }

        return query;
    }

    async delete(id: string): Promise<void> {
        try {
            const task = await this.model.findById(id);
            if (!task) {
                throw new NotFoundError(`${id} ID'li görev bulunamadı`);
            }
            await task.deleteOne();
        } catch (error: any) {
            logger.error('Repository error:', { error, method: 'delete' });
            if (error.name === 'CastError') {
                throw new ValidationError('Geçersiz ID formatı');
            }
            throw error;
        }
    }

    async findByProcessId(processId: string): Promise<ITask[]> {
        try {
            const tasks = await this.model.find({ processId })
                .populate('assignee', 'name email')
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');
                
            return tasks;
        } catch (error: any) {
            logger.error('Repository error:', { error, method: 'findByProcessId' });
            if (error.name === 'CastError') {
                throw new ValidationError('Geçersiz ID formatı');
            }
            throw error;
        }
    }

    async sendNotification(userId: string, type: string, data: any): Promise<void> {
        // Bildirim gönderme mantığı
    }
}