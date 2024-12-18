import { type Response, type NextFunction } from 'express';

import { type AuthenticatedRequest } from '@/features/auth/middleware/auth.middleware';
import { AuthenticationError } from '@/shared/errors/common/authentication.error';
import { type CreateTaskDTO, type UpdateTaskDTO, type TaskFilterDTO } from '@/shared/types/dtos/task.dto';

import { type TaskService } from '../services/task.service';

type AuthHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => Promise<void>;

export class TaskController {
    constructor(private taskService: TaskService) { }

    public createTask: AuthHandler = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthenticationError('Unauthorized');
            }
            const taskData: CreateTaskDTO = req.body;
            const task = await this.taskService.createTask(taskData, req.user._id);

            res.status(201).json({
                status: 'success',
                data: { task }
            });
        } catch (error) {
            next(error);
        }
    };

    public updateTaskStatus: AuthHandler = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthenticationError('Unauthorized');
            }
            const task = await this.taskService.updateTaskStatus(
                req.params.id,
                req.body.status,
                req.user._id
            );

            res.status(200).json({
                status: 'success',
                data: { task }
            });
        } catch (error) {
            next(error);
        }
    };

    public getTask: AuthHandler = async (req, res, next) => {
        try {
            const task = await this.taskService.getTask(req.params.id);
            res.status(200).json({
                status: 'success',
                data: { task }
            });
        } catch (error) {
            next(error);
        }
    };

    public getTasks: AuthHandler = async (req, res, next) => {
        try {
            const filters: TaskFilterDTO = req.query;
            const result = await this.taskService.getTasks(filters);

            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public updateTask: AuthHandler = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthenticationError('Unauthorized');
            }
            const updateData: UpdateTaskDTO = req.body;
            const task = await this.taskService.updateTask(
                req.params.id,
                updateData,
                req.user._id
            );

            res.status(200).json({
                status: 'success',
                data: { task }
            });
        } catch (error) {
            next(error);
        }
    };

    public deleteTask: AuthHandler = async (req, res, next) => {
        try {
            const result = await this.taskService.deleteTask(req.params.id);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };
}