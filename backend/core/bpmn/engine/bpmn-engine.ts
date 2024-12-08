import { type ParsedBPMN } from '../parsers/bpmn-parser';

interface ProcessInstance {
    id: string;
    processId: string;
    currentElement: any;
    status: 'active' | 'completed' | 'terminated';
    variables: Record<string, any>;
    history: Array<{
        elementId: string;
        type: string;
        timestamp: Date;
        data?: Record<string, any>;
    }>;
    createdAt: Date;
}

export class BPMNEngine {
    private instances: Map<string, ProcessInstance> = new Map();

    async startProcess(bpmn: ParsedBPMN, context: { processId: any; userId: any; }): Promise<ProcessInstance> {
        const instanceId = `PROC_${context.processId}`;
        const instance: ProcessInstance = {
            id: instanceId,
            processId: context.processId.toString(),
            currentElement: bpmn.elements[0],
            status: 'active',
            variables: {},
            history: [],
            createdAt: new Date()
        };

        this.instances.set(instanceId, instance);
        console.info('Process instance started', { instanceId, processId: context.processId });
        return instance;
    }

    getInstanceStatus(instanceId: string): string {
        const instance = this.instances.get(instanceId);
        return instance?.status || 'unknown';
    }

    async updateInstanceStatus(instanceId: string, status: string): Promise<void> {
        const instance = this.instances.get(instanceId);
        if (instance) {
            instance.status = status as 'active' | 'completed' | 'terminated';
            this.instances.set(instanceId, instance);
        }
    }

    async stopInstance(instanceId: string): Promise<void> {
        this.instances.delete(instanceId);
        console.info('Process instance stopped', { instanceId });
    }
} 