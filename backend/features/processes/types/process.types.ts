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

export type StepType = "task" | "approval" | "notification" | "automation" | "decision";
export type StepStatus = "pending" | "completed" | "rejected";
export type StepPriority = "low" | "medium" | "high";

export interface ProcessStep {
  id?: string;
  elementId?: string;
  name: string;
  type: StepType;
  status: StepStatus;
  priority?: StepPriority;
  assignedTo?: Types.ObjectId;
  dueDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  sequence: number;
  dependsOn: string[];
  notes?: string;
  metadata?: {
    estimatedDuration?: number;
    costCenter?: string;
    tags?: string[];
  };
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
