import { type Model, Types } from 'mongoose';

import { type IProcess, Process } from '@/features/processes/models/process.model';
import { NotFoundError, ValidationError } from '@/shared/errors/types/app-error';
import { type IProcessRepository } from '@/shared/interfaces/repositories/IProcessRepository';
import { type CreateProcessDTO, type UpdateProcessDTO, type ProcessFilterDTO } from '@/shared/types/dtos/process.dto';
import { logger } from '@/shared/utils/logger';

export class ProcessRepository implements IProcessRepository {
    private model: Model<IProcess>;

    constructor() {
        this.model = Process;
    }

    async create(data: CreateProcessDTO, userId: Types.ObjectId): Promise<IProcess> {
        try {
            const existingProcess = await this.model.findOne({
                name: { $regex: `^${data.name}$`, $options: 'i' },
                version: 1
            });

            if (existingProcess) {
                throw new ValidationError(`"${data.name}" isimli süreç zaten var`);
            }

            const process = new this.model({
                ...data,
                version: 1,
                createdBy: userId,
                updatedBy: userId
            });

            return await process.save();
        } catch (error: any) {
            logger.error('Repository error:', { 
                error, 
                method: 'create',
                processName: data.name 
            });

            if (error.code === 11000) {
                throw new ValidationError(`"${data.name}" isimli süreç zaten var`);
            }
            throw error;
        }
    }

    async findById(id: string): Promise<IProcess | null> {
        try {
            const process = await this.model.findById(id)
                .populate('createdBy', 'email name')
                .populate('updatedBy', 'email name');

            if (!process) {
                throw new NotFoundError(`${id} ID'li süreç bulunamadı`);
            }

            return process;
        } catch (error: any) {
            logger.error('Repository error:', { 
                error, 
                method: 'findById',
                processId: id 
            });
            
            if (error.name === 'CastError') {
                throw new ValidationError('Geçersiz süreç ID formatı');
            }
            throw error;
        }
    }

    async findAll(filters: ProcessFilterDTO): Promise<{ processes: IProcess[]; total: number }> {
        const { page = 0, limit = 10, status, search } = filters;
        const query: any = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [processes, total] = await Promise.all([
            this.model.find(query)
                .populate('createdBy', 'email name')
                .populate('updatedBy', 'email name')
                .skip(Number(page) * Number(limit))
                .limit(Number(limit))
                .sort({ createdAt: -1 }),
            this.model.countDocuments(query)
        ]);

        return { processes, total };
    }

    async update(id: string, data: UpdateProcessDTO, userId: Types.ObjectId): Promise<IProcess> {
        try {
            if (data.name) {
                const existingProcess = await this.model.findOne({ 
                    name: { $regex: `^${data.name}$`, $options: 'i' },
                    _id: { $ne: new Types.ObjectId(id) }
                });
                
                if (existingProcess) {
                    throw new ValidationError(`"${data.name}" isimli başka bir süreç zaten var`);
                }
            }

            const process = await this.model.findByIdAndUpdate(
                id,
                { ...data, updatedBy: userId },
                { new: true, runValidators: true }
            ).populate('createdBy updatedBy', 'email name');

            if (!process) {
                throw new NotFoundError(`${id} ID'li süreç bulunamadı`);
            }

            return process;
        } catch (error: any) {
            logger.error('Repository error:', { error, method: 'update', processId: id, userId });
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        const result = await this.model.findByIdAndDelete(id);
        if (!result) {
            throw new NotFoundError(`${id} ID'li süreç bulunamadı`);
        }
    }

    async exists(id: string): Promise<boolean> {
        const count = await this.model.countDocuments({ _id: id });
        return count > 0;
    }
} 