import { type BPMNElement } from "@/core/bpmn/parsers/bpmn-parser";
import { type ProcessResponseDTO } from "@/shared/types/dtos/process.dto";

import { type IProcess } from "../models/process.model.js";
import { type StepStatus, type StepType } from "../types/process.types";

export function convertBpmnToProcessSteps(elements: BPMNElement[]) {
  const supportedTypes = [
    "userTask",
    "serviceTask",
    "approvalTask",
    "scriptTask",
    "businessRuleTask"
  ];

  return elements
    .filter(element => supportedTypes.includes(element.type))
    .map((element, index) => ({
      elementId: element.id,
      name: element.name || element.id,
      type: mapBpmnTypeToProcessType(element.type),
      status: "pending" as StepStatus,
      sequence: index + 1,
      dependsOn: element.outgoing
    }));
}

export function mapBpmnTypeToProcessType(bpmnType?: string): string {
  if (!bpmnType) return "task";

  switch (bpmnType) {
    case "userTask":
      return "task";
    case "serviceTask":
      return "notification";
    case "approvalTask":
      return "approval";
    case "scriptTask":
      return "automation";
    case "businessRuleTask":
      return "decision";
    default:
      return "task";
  }
}
export function convertProcessToDTO(process: IProcess): ProcessResponseDTO {
  return {
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
    isTemplate: process.isTemplate,
    version: process.version,
    steps: process.steps,
    createdAt: process.createdAt,
    updatedAt: process.updatedAt,
    createdBy: process.createdBy.toString(),
    updatedBy: process.updatedBy?.toString()
  };
}
