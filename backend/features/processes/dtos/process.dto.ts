import { Types } from 'mongoose';

export interface CreateProcessDTO {
    name: string;
    description?: string;
    bpmnXml: string;
    category: string;
    priority?: 'low' | 'medium' | 'high';
    participants?: Types.ObjectId[];
    metadata?: {
        estimatedDuration?: number;
        costCenter?: string;
        tags?: string[];
    };
    isTemplate?: boolean;
}

export interface UpdateProcessDTO {
    name?: string;
    description?: string;
    bpmnXml?: string;
    status?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    participants?: Types.ObjectId[];
    metadata?: {
        estimatedDuration?: number;
        costCenter?: string;
        tags?: string[];
    };
    isTemplate?: boolean;
    updatedAt: Date;
}

export interface ProcessFilterDTO {
    page?: number;
    limit?: number;
    createdBy?: Types.ObjectId;
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
} 