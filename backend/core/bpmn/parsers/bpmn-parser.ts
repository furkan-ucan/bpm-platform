export interface BPMNElement {
    id: string;
    type: string;
    name?: string;
    outgoing?: string[];
    properties?: Record<string, any>;
}

export interface ParsedBPMN {
    id: string;
    name: string;
    elements: BPMNElement[];
}

export function parseBPMNXml(_xml: string): ParsedBPMN {
    // Basit bir XML parser implementasyonu
    return {
        id: 'default',
        name: 'Default Process',
        elements: [
            {
                id: 'StartEvent_1',
                type: 'startEvent',
                name: 'Başlangıç',
                outgoing: []
            }
        ]
    };
} 