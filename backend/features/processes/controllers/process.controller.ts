import { type Response, type NextFunction } from 'express';
import {
    type AuthenticatedRequest,
    type AuthRequestHandler
} from '@/shared/types/auth';
import { AuthenticationError } from '@/shared/errors/common/authentication.error';
import { ProcessOperationError } from '../errors/process.errors';
import { ProcessService } from '../services/process.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-messages';
import {
    type CreateProcessDTO,
    type UpdateProcessDTO,
    type ProcessFilterDTO
} from '@/shared/types/dtos/process.dto';
export class ProcessController {
    constructor(private readonly processService: ProcessService) { }

    public createProcess: AuthRequestHandler = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthenticationError('Kimlik doğrulaması gerekli');
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
                throw new AuthenticationError('Kimlik doğrulaması gerekli');
            }

            const result = await this.processService.deleteProcess(req.params.id);

            if (!result) {
                throw new ProcessOperationError(ERROR_MESSAGES.PROCESS.DELETE_FAILED);
            }

            res.status(200).json({
                status: 'success',
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    };
} 