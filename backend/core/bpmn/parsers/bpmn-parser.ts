import { BPMNProcessDefinition } from '@/features/processes/types/process.types';

export interface BPMNElement {
    id: string;
    type: 'startEvent' | 'task' | 'endEvent' | 'userTask' | 'serviceTask';
    name: string;
    outgoing?: string[];
}

export interface ParsedBPMN {
    id: string;
    name: string;
    elements: BPMNElement[];
}

export class BPMNParser {
    public static parse(xml: string): ParsedBPMN {
        // TODO: XML parsing implementation
        const mockParsedBpmn: ParsedBPMN = {
            id: `proc_${Date.now()}`,
            name: 'Parsed Process',
            elements: [
                {
                    id: 'task_1',
                    type: 'userTask',
                    name: 'User Task 1'
                },
                {
                    id: 'task_2',
                    type: 'serviceTask',
                    name: 'Service Task 1'
                }
            ]
        };

        return mockParsedBpmn;
    }
} 