import { Types } from 'mongoose';
import { type IProcess } from '@/features/processes/models/process.model';
import { ProcessStatus } from '@/features/processes/types/process.types';
import { createMockMongooseDocument } from './mongoose.fixtures';

export const createMockProcess = (overrides = {}) => {
  const baseProcess: IProcess = {
    _id: new Types.ObjectId(),
    name: 'Test Process',
    description: 'Test Description',
    bpmnXml: '<xml>test</xml>',
    status: ProcessStatus.DRAFT,
    isTemplate: false,
    version: 1,
    steps: [],
    createdBy: new Types.ObjectId(),
    updatedBy: new Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return createMockMongooseDocument<IProcess>({
    ...baseProcess,
    ...overrides
  });
};
