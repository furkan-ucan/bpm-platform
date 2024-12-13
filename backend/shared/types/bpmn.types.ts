export interface BPMNElement {
    id: string;
    name?: string;
    type: string;
    outgoing: string[];
}

export type BPMNElementType =
    | "userTask"
    | "serviceTask"
    | "approvalTask"
    | "scriptTask"
    | "businessRuleTask"
    | "startEvent"
    | "endEvent"
    | "gateway"; 