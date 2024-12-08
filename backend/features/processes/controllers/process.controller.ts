import { type Response, type NextFunction , RequestHandler as ExpressHandler } from 'express';

import { type AuthenticatedRequest } from '@/features/auth/middleware/auth.middleware';
import { type CreateProcessDTO, type UpdateProcessDTO, type ProcessFilterDTO } from '@/shared/types/dtos/process.dto';

import { type ProcessService } from '../services/process.service';

type AuthRequestHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => Promise<void>;

export class ProcessController {
    constructor(private processService: ProcessService) {}

    public createProcess: AuthRequestHandler = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new Error('Unauthorized');
            }
            const processData: CreateProcessDTO = req.body;
            const process = await this.processService.createProcess(
                processData,
                req.user.id
            );
            
            res.status(201).json({
                status: 'success',
                data: { process }
            });
        } catch (error) {
            next(error);
        }
    };

    public getProcesses: AuthRequestHandler = async (req, res, next) => {
        try {
            const filters: ProcessFilterDTO = req.query;
            const result = await this.processService.getProcesses(filters);
            
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    public getProcessById: AuthRequestHandler = async (req, res, next) => {
        try {
            const process = await this.processService.getProcessById(req.params.id);
            
            res.status(200).json({
                status: 'success',
                data: { process }
            });
        } catch (error) {
            next(error);
        }
    };

    public updateProcess: AuthRequestHandler = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new Error('Unauthorized');
            }
            const updateData: UpdateProcessDTO = req.body;
            const process = await this.processService.updateProcess(
                req.params.id,
                updateData,
                req.user.id
            );
            
            res.status(200).json({
                status: 'success',
                data: { process }
            });
        } catch (error) {
            next(error);
        }
    };

    public deleteProcess: AuthRequestHandler = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new Error('Unauthorized');
            }
            const result = await this.processService.deleteProcess(req.params.id);
            
            res.status(200).json({
                status: 'success',
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    };
} 