import { BPMNElement } from "@/core/bpmn/parsers/bpmn-parser";

export type ProcessStatus = "active" | "inactive" | "archived" | "completed";
export type StepType = "task" | "approval" | "notification";
export type StepStatus = "pending" | "completed" | "rejected";

export interface ProcessStep {
  name: string;
  type: StepType;
  status: StepStatus;
  assignedTo?: string;
  dueDate?: Date;
}

export interface ProcessHistoryEntry {
  elementId: string;
  type: string;
  timestamp: Date;
  data?: Record<string, any>;
}

export interface ProcessInstance {
  id: string;
  processId: string;
  currentElement: BPMNElement;
  status: "active" | "completed" | "terminated";
  variables: Record<string, any>;
  history: ProcessHistoryEntry[];
  createdAt: Date;
}

export interface BPMNProcessDefinition {
  id: string;
  name: string;
  elements: Array<{
    id: string;
    type: string;
    name?: string;
    assignee?: string;
    dueDate?: Date;
  }>;
}
