import { type BPMNElement } from '@/core/bpmn/parsers/bpmn-parser';

export enum ProcessStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export type StepType = 'task' | 'approval' | 'notification';
export type StepStatus = 'pending' | 'completed' | 'rejected';

export interface ProcessStep {
  id: string;
  elementId: string;
  name: string;
  type: StepType;
  status: StepStatus;
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  data?: Record<string, any>;
}

export interface ProcessHistoryEntry {
  elementId: string;
  type: string;
  timestamp: Date;
  userId?: string;
  stepId?: string;
  status?: StepStatus;
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
