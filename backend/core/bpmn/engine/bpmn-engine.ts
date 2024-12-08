import type { ProcessContext, ProcessInstance } from '../types/process.types';
import type { ParsedBPMN } from '../parsers/bpmn-parser';

export interface BPMNEngine {
    startProcess: (definition: ParsedBPMN, context: ProcessContext) => Promise<ProcessInstance>;
    stopInstance: (instanceId: string) => Promise<void>;
    getInstanceStatus: (instanceId: string) => Promise<ProcessInstance>;
    updateInstanceStatus: (instanceId: string, status: string) => Promise<void>;
    executeTask: (taskId: string, data: any) => Promise<void>;
} 