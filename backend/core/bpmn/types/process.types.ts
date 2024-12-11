import { type BPMNElement } from "../parsers/bpmn-parser";
import { type ProcessHistoryEntry } from "@/features/processes/types/process.types";

export interface ProcessContext {
  processId: string;
  userId: string;
  variables?: Record<string, any>;
}

export enum ProcessInstanceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMPLETED = "completed",
  FAILED = "failed",
  SUSPENDED = "suspended",
}

export interface ProcessInstance {
  id: string;
  processId: string;
  currentElement: BPMNElement;
  status: ProcessInstanceStatus;
  variables?: Record<string, any>;
  history: ProcessHistoryEntry[];
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}
