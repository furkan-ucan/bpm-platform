import { type Types } from "mongoose";

import {
  type ProcessStatus,
  type StepType,
  type StepStatus,
} from "@/features/processes/types/process.types";

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
  status?: ProcessStatus;
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

export interface ProcessStepDTO {
  name: string;
  type: StepType;
  assignee?: Types.ObjectId;
  dueDate?: Date;
  status: StepStatus;
}

export interface ProcessFilterDTO {
  page?: number;
  limit?: number;
  createdBy?: Types.ObjectId;
  status?: 'active' | 'inactive' | 'archived';
  category?: string;
  priority?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ProcessResponseDTO {
  id: string;
  name: string;
  description?: string;
  bpmnXml: string;
  status: ProcessStatus;
  category: string;
  priority: 'low' | 'medium' | 'high';
  owner?: string;
  participants?: string[];
  metadata?: {
    estimatedDuration?: number;
    costCenter?: string;
    tags?: string[];
  };
  createdBy: string;
  updatedBy?: string;
  version: number;
  isTemplate: boolean;
  steps: ProcessStepDTO[];
  createdAt: Date;
  updatedAt: Date;
}
