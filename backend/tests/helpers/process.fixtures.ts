import { Types } from "mongoose";
import { type IProcess } from "@/features/processes/models/process.model";
import { ProcessStatus } from "@/features/processes/types/process.types";
import {
  type CreateProcessDTO,
  type UpdateProcessDTO,
} from "@/shared/types/dtos/process.dto";

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
  lastUpdated: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createProcessDTO: CreateProcessDTO = {
  name: "Test Process",
  description: "Test Description",
  bpmnXml: "<xml>test</xml>",
  isTemplate: false,
};

export const updateProcessDTO: UpdateProcessDTO = {
  name: "Updated Process",
  description: "Updated Description",
  bpmnXml: "<xml>updated</xml>",
  status: ProcessStatus.ACTIVE,
  isTemplate: false,
  lastUpdated: new Date(),
  updatedAt: new Date(),
};
