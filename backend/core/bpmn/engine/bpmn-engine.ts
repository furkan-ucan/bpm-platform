import type { ProcessContext, ProcessInstance } from '../types/process.types';
import type { ParsedBPMN } from '../parsers/bpmn-parser';
import { ProcessInstanceStatus } from '../types/process.types';
import { logger } from "@/shared/utils/logger";

export interface BPMNEngine {
    startProcess: (definition: ParsedBPMN, context: ProcessContext) => Promise<ProcessInstance>;
    stopInstance: (instanceId: string) => Promise<void>;
    getInstanceStatus: (instanceId: string) => Promise<ProcessInstance>;
    updateInstanceStatus: (instanceId: string, status: ProcessInstanceStatus) => Promise<void>;
    executeTask: (processInstanceId: string, stepId: string, data: any) => Promise<void>;
}

export class BPMNEngineImpl implements BPMNEngine {
    private instances: Map<string, ProcessInstance>;

    constructor() {
        this.instances = new Map();
    }

    async startProcess(definition: ParsedBPMN, context: ProcessContext): Promise<ProcessInstance> {
        try {
            const instance: ProcessInstance = {
                id: context.processId,
                processId: context.processId,
                currentElement: definition.elements[0],
                status: ProcessInstanceStatus.ACTIVE,
                variables: context.variables || {},
                history: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.instances.set(instance.id, instance);
            logger.info("Process instance started", { instanceId: instance.id });
            return instance;
        } catch (error) {
            logger.error("Process start error:", error);
            throw error;
        }
    }

    async stopInstance(instanceId: string): Promise<void> {
        try {
            this.instances.delete(instanceId);
            logger.info("Process instance stopped", { instanceId });
        } catch (error) {
            logger.error("Process stop error:", error);
            throw error;
        }
    }

    async getInstanceStatus(instanceId: string): Promise<ProcessInstance> {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error(`Instance not found: ${instanceId}`);
        }
        return instance;
    }

    async updateInstanceStatus(instanceId: string, status: ProcessInstanceStatus): Promise<void> {
        const instance = this.instances.get(instanceId);
        if (instance) {
            instance.status = status;
            logger.info("Instance status updated", { instanceId, status });
        }
    }

    async executeTask(processInstanceId: string, stepId: string, data: any): Promise<void> {
        try {
            logger.info("Task executed", { processInstanceId, stepId, data });
        } catch (error) {
            logger.error("Task execution error:", error);
            throw error;
        }
    }
}

export const bpmnEngine = new BPMNEngineImpl(); 