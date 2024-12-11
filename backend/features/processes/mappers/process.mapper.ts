import { type IProcess } from '../models/process.model';
import { type ProcessResponseDTO } from '@/shared/types/dtos/process.dto';

export class ProcessMapper {
    static toDTO(process: IProcess): ProcessResponseDTO {
        return {
            id: process._id.toString(),
            name: process.name,
            description: process.description,
            status: process.status,
            createdBy: process.createdBy.toString(),
            updatedBy: process.updatedBy?.toString(),
            version: process.version,
            isTemplate: process.isTemplate,
            steps: process.steps,
            createdAt: process.createdAt,
            updatedAt: process.updatedAt
        };
    }
} 