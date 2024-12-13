import { type BPMNElement } from "@/core/bpmn/parsers/bpmn-parser";
import { type ProcessResponseDTO } from "@/shared/types/dtos/process.dto";

import { type IProcess } from "../models/process.model.js";
import {
  ProcessStep,
  type StepStatus,
  type StepType,
} from "../types/process.types";

export function convertBpmnToProcessSteps(
  elements: BPMNElement[],
): ProcessStep[] {
  const supportedTypes = [
    "userTask",
    "serviceTask",
    "approvalTask",
    "scriptTask",
    "businessRuleTask",
    "automationTask",
    "decisionTask",
  ];

  // Geçerli elementleri filtrele
  const validElements = elements.filter((element) => {
    try {
      if (!element?.id || !element?.type) return false;
      if (typeof element.id !== "string" || typeof element.type !== "string")
        return false;
      if (element.id.trim() === "" || element.type.trim() === "") return false;
      if (!supportedTypes.includes(element.type)) return false;
      if (element.outgoing !== undefined && !Array.isArray(element.outgoing))
        return false;
      return true;
    } catch {
      return false;
    }
  });

  // Hiç geçerli element yoksa veya tüm elementler geçersizse boş dizi döndür
  if (
    validElements.length === 0 ||
    validElements.length !==
      elements.filter((e) => supportedTypes.includes(e.type)).length
  ) {
    return [];
  }

  const elementMap = new Map<string, BPMNElement>();
  const dependencyMap = new Map<string, string[]>();

  // İlk geçiş: elementleri ve bağlantıları topla
  validElements.forEach((element) => {
    elementMap.set(element.id, element);
    if (Array.isArray(element.outgoing)) {
      dependencyMap.set(element.id, element.outgoing);
    }
  });

  // İkinci geçiş: sadece desteklenen elementler arasındaki bağlantıları al
  return Array.from(elementMap.values()).map((element, index) => ({
    elementId: element.id,
    name: element.name || element.id,
    type: mapBpmnTypeToProcessType(element.type),
    status: "pending",
    priority: "medium",
    sequence: index + 1,
    dependsOn:
      dependencyMap
        .get(element.id)
        ?.filter((targetId) => elementMap.has(targetId)) || [],
  }));
}

export function mapBpmnTypeToProcessType(
  bpmnType: string | undefined,
): StepType {
  if (!bpmnType) return "task";

  const typeMap: Record<string, StepType> = {
    userTask: "task",
    serviceTask: "notification",
    approvalTask: "approval",
    scriptTask: "automation",
    businessRuleTask: "decision",
    automationTask: "automation",
    decisionTask: "decision",
  };

  return typeMap[bpmnType] || "task";
}

export function convertProcessToDTO(process: IProcess): ProcessResponseDTO {
  return {
    id: process._id.toString(), // _id'yi id'ye dönüştür
    name: process.name,
    description: process.description,
    bpmnXml: process.bpmnXml,
    status: process.status,
    category: process.category,
    priority: process.priority,
    owner: process.owner?.toString(),
    participants: process.participants?.map((p) => p.toString()),
    metadata: process.metadata,
    isTemplate: process.isTemplate,
    version: process.version,
    steps: process.steps,
    createdAt: process.createdAt,
    updatedAt: process.updatedAt,
    createdBy: process.createdBy.toString(),
    updatedBy: process.updatedBy?.toString(),
  };
}
