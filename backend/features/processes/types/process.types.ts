import { type BPMNElement } from "@/core/bpmn/parsers/bpmn-parser";
import { Types } from "mongoose";

export enum ProcessStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export type StepType = "task" | "approval" | "notification";
export type StepStatus = "pending" | "completed" | "rejected";

export interface ProcessStep {
  id?: string;
  elementId?: string;
  name: string;
  type: 'task' | 'approval' | 'notification';
  status: 'pending' | 'completed' | 'rejected';
  assignedTo?: Types.ObjectId;
  dueDate?: Date;
  sequence: number;
  dependsOn: string[];
  data?: Record<string, any>;
}

export interface ProcessHistoryEntry {
  elementId: string;
  type: string;
  timestamp: Date;
  userId?: string;
  stepId: string;
  status?: StepStatus;
  action: string;
  data?: Record<string, any>;
}

export interface ProcessInstance {
  id: string;
  processId: string;
  currentElement: BPMNElement;
  status: ProcessStatus;
  variables: Record<string, any>;
  history: ProcessHistoryEntry[];
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface BPMNProcessDefinition {
  id: string;
  name: string;
  version: number;
  elements: Array<{
    id: string;
    type: string;
    name?: string;
    assignee?: string;
    dueDate?: Date;
    properties?: Record<string, any>;
  }>;
}
