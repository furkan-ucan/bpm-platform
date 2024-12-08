import { Types } from 'mongoose';
import { ITaskRepository } from '@/shared/interfaces/repositories/ITaskRepository';
import { CreateTaskDTO, UpdateTaskDTO, TaskFilterDTO } from '@/shared/types/dtos/task.dto';
import { ValidationError } from '@/shared/errors/types/app-error';
import { convertTaskToDTO } from '@/features/tasks/utils/task.utils';
import { BPMNEngine } from '@/core/bpmn/engine/bpmn-engine';

export class TaskService {
    constructor(
        private taskRepository: ITaskRepository,
        private bpmnEngine: BPMNEngine
    ) {}

    async createTask(data: CreateTaskDTO, userId: Types.ObjectId) {
        try {
            const task = await this.taskRepository.create({
                ...data,
                status: 'pending',
                createdBy: userId,
                updatedBy: userId
            }, userId);

            await this.bpmnEngine.executeTask(
                `PROC_${task.processId}`,
                task.stepId,
                {
                    taskId: task._id,
                    status: 'created'
                }
            );

            return convertTaskToDTO(task);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors)
                    .map((err: any) => err.message)
                    .join(', ');
                throw new ValidationError(messages);
            }
            throw error;
        }
    }

    async updateTaskStatus(id: string, status: string, userId: Types.ObjectId) {
        const task = await this.taskRepository.updateStatus(id, status, userId);
        
        await this.bpmnEngine.executeTask(
            `PROC_${task.processId}`,
            task.stepId,
            {
                taskId: task._id,
                status: status,
                completedBy: userId
            }
        );

        return convertTaskToDTO(task);
    }

    async getTask(id: string) {
        try {
            const task = await this.taskRepository.findById(id);
            if (!task) {
                throw new ValidationError(`${id} ID'li görev bulunamadı`);
            }
            return convertTaskToDTO(task);
        } catch (error: any) {
            if (error.name === 'CastError') {
                throw new ValidationError('Geçersiz görev ID formatı');
            }
            throw error;
        }
    }

    async getTasks(filters: TaskFilterDTO) {
        const result = await this.taskRepository.findAll(filters);
        return {
            tasks: result.tasks.map(convertTaskToDTO),
            pagination: {
                total: result.total,
                page: Number(filters.page) || 0,
                limit: Number(filters.limit) || 10,
                pages: Math.ceil(result.total / (Number(filters.limit) || 10))
            }
        };
    }

    async updateTask(id: string, data: UpdateTaskDTO, userId: Types.ObjectId) {
        try {
            const task = await this.taskRepository.update(id, data, userId);
            return convertTaskToDTO(task);
        } catch (error: any) {
            if (error.name === 'CastError') {
                throw new ValidationError('Geçersiz görev ID formatı');
            }
            throw error;
        }
    }

    async deleteTask(id: string) {
        try {
            await this.taskRepository.delete(id);
            return { message: 'Görev başarıyla silindi' };
        } catch (error: any) {
            if (error.name === 'CastError') {
                throw new ValidationError('Geçersiz görev ID formatı');
            }
            throw error;
        }
    }
} 