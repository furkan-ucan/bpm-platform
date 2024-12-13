import { type IProcess } from "../models/process.model";
import { type ProcessResponseDTO } from "@/shared/types/dtos/process.dto";

export class ProcessMapper {
  static toDTO(process: IProcess): ProcessResponseDTO {
    return {
      id: process._id.toString(), // _id'yi string'e dönüştür
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
}
