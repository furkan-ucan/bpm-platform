import { Types } from 'mongoose';
import { IProcess } from '@/features/processes/models/process.model';
import { CreateProcessDTO, UpdateProcessDTO, ProcessFilterDTO } from '@/shared/types/dtos/process.dto';

export interface IProcessRepository {
    create(data: CreateProcessDTO, userId: Types.ObjectId): Promise<IProcess>;
    findById(id: string): Promise<IProcess | null>;
    findAll(filters: ProcessFilterDTO): Promise<{
        processes: IProcess[];
        total: number;
    }>;
    update(id: string, data: UpdateProcessDTO, userId: Types.ObjectId): Promise<IProcess>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
} 