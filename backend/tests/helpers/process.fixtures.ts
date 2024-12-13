import { Types } from "mongoose";
import { type IProcess } from "@/features/processes/models/process.model";
import {
  ProcessStatus,
  type ProcessStep,
  type StepType,
  type StepStatus
} from "@/features/processes/types/process.types";
import {
  type CreateProcessDTO,
  type UpdateProcessDTO,
} from "@/shared/types/dtos/process.dto";
import { type BPMNElement } from "@/shared/types/bpmn.types";

export const createMockProcess = (overrides = {}): IProcess => ({
  _id: new Types.ObjectId(),
  name: "Test Process",
  description: "Test Description",
  bpmnXml: "<xml>test</xml>",
  status: ProcessStatus.ACTIVE,
  category: "test",
  priority: "medium",
  owner: new Types.ObjectId(),
  participants: [],
  metadata: {
    estimatedDuration: 60,
    tags: [],
  },
  isTemplate: false,
  version: 1,
  steps: [],
  createdBy: new Types.ObjectId(),
  updatedBy: new Types.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockProcessResult = (processes: IProcess[]) => ({
  processes,
  total: processes.length,
});

export const createMockUpdateProcessDTO = (overrides = {}) => ({
  name: "Updated Process",
  description: "Updated Description",
  status: ProcessStatus.ACTIVE,
  bpmnXml: "<xml>updated</xml>",
  isTemplate: false,
  updatedAt: new Date(),
  ...overrides,
});

export const createProcessDTO: CreateProcessDTO = {
  name: "Test Process",
  description: "Test Description",
  bpmnXml: "<xml>test</xml>",
  isTemplate: false,
  category: "test",
};

export const updateProcessDTO: UpdateProcessDTO = {
  name: "Updated Process",
  description: "Updated Description",
  bpmnXml: "<xml>updated</xml>",
  status: ProcessStatus.ACTIVE,
  isTemplate: false,
  updatedAt: new Date()
};

export const createExpectedProcessDTO = (process: IProcess) => ({
  id: process._id.toString(),
  name: process.name,
  description: process.description,
  bpmnXml: process.bpmnXml,
  status: process.status,
  category: process.category,
  priority: process.priority,
  owner: process.owner?.toString(),
  participants: process.participants?.map(p => p.toString()),
  metadata: process.metadata,
  steps: process.steps,
  isTemplate: process.isTemplate,
  version: process.version,
  createdBy: process.createdBy.toString(),
  updatedBy: process.updatedBy?.toString(),
  createdAt: process.createdAt,
  updatedAt: process.updatedAt,
});

export const createBpmnElement = (overrides = {}): BPMNElement => ({
  id: "task1",
  name: "Test Task",
  type: "userTask",
  outgoing: [],
  ...overrides
});

export interface ProcessStepOverrides {
  elementId?: string;
  name?: string;
  type?: StepType;
  status?: StepStatus;
  sequence?: number;
  dependsOn?: string[];
}

export const createExpectedProcessStep = (overrides: ProcessStepOverrides = {}): ProcessStep => ({
  elementId: overrides.elementId || "",
  name: overrides.name || "",
  type: overrides.type || "task",
  status: "pending",
  priority: "medium",
  sequence: overrides.sequence || 1,
  dependsOn: overrides.dependsOn || [],
});
