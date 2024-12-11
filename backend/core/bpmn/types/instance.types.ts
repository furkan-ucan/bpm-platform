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
  status: ProcessInstanceStatus;
  currentStepId: string;
  variables: Record<string, any>;
  history: ProcessHistoryEntry[];
  startedAt: Date;
  updatedAt: Date;
  lastUpdated: Date;
  completedAt?: Date;
}

export interface ProcessHistoryEntry {
  stepId: string;
  action: string;
  timestamp: Date;
  userId: string;
  data?: Record<string, any>;
}

export interface BPMNHistoryEntry {
  stepId: string;
  action: string;
  timestamp: Date;
  userId?: string;
  data?: Record<string, any>;
}
