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
  isTemplate?: boolean;
}

export interface UpdateProcessDTO {
  name?: string;
  description?: string;
  bpmnXml?: string;
  status?: ProcessStatus;
  isTemplate?: boolean;
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
  status?: "active" | "inactive" | "archived";
  search?: string;
  createdBy?: string;
  isTemplate?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface ProcessResponseDTO {
  id: string;
  name: string;
  description?: string;
  status: ProcessStatus;
  createdBy: string;
  updatedBy?: string;
  version: number;
  isTemplate: boolean;
  steps: ProcessStepDTO[];
  createdAt: Date;
  updatedAt: Date;
}
