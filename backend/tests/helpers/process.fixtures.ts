import { Types, Document } from "mongoose";
import { IProcess } from "../../features/processes/models/process.model";
import { ProcessStatus } from "../../features/processes/types/process.types";
import { createMockMongooseDocument } from "./mongoose.fixtures";

interface MockProcessOptions {
  _id?: Types.ObjectId;
  name?: string;
  description?: string;
  status?: ProcessStatus;
  isTemplate?: boolean;
  steps?: any[];
  version?: number;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  bpmnXml?: string;
  createdAt?: Date; // Eklendi
  updatedAt?: Date; // Eklendi
}

export const createMockProcess = (
  options: MockProcessOptions = {}
): IProcess => {
  const defaultData = {
    _id: options._id || new Types.ObjectId(),
    name: options.name || "Test Process",
    description: options.description || "Test Description",
    status: options.status || "active",
    isTemplate: options.isTemplate ?? false,
    steps: options.steps || [],
    version: options.version || 1,
    bpmnXml:
      options.bpmnXml ||
      "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>",
    createdBy: options.createdBy || new Types.ObjectId(),
    updatedBy: options.updatedBy || new Types.ObjectId(),
    createdAt: options.createdAt || new Date(),
    updatedAt: options.updatedAt || new Date(),
  };

  return createMockMongooseDocument(defaultData) as unknown as IProcess;
};
