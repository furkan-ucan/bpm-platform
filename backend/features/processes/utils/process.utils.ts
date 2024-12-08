import { BPMNElement } from "@/core/bpmn/parsers/bpmn-parser";
import { IProcess } from "../models/process.model";
import { ProcessResponseDTO } from "@/shared/types/dtos/process.dto";

export function convertBpmnToProcessSteps(elements: BPMNElement[]) {
  return elements.map((element) => ({
    name: element.name || element.id,
    type: mapBpmnTypeToProcessType(element.type),
    status: "pending",
  }));
}

export function mapBpmnTypeToProcessType(
  bpmnType: string
): "task" | "approval" | "notification" {
  switch (bpmnType) {
    case "userTask":
      return "task";
    case "serviceTask":
      return "notification";
    default:
      return "task";
  }
}
export function convertProcessToDTO(process: IProcess): ProcessResponseDTO {
  return {
    id: process._id.toString(),
    name: process.name,
    description: process.description,
    status: process.status,
    createdBy: process.createdBy.toString(), // Convert ObjectId to string
    updatedBy: process.updatedBy?.toString(), // Convert ObjectId to string if it exists
    version: process.version,
    isTemplate: process.isTemplate,
    steps: process.steps,
    createdAt: process.createdAt,
    updatedAt: process.updatedAt,
  };
}
