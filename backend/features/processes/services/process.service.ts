import { type Types } from "mongoose";

import { type BPMNEngine } from "@/core/bpmn/engine/bpmn-engine.js";
import { type ParsedBPMN } from "@/core/bpmn/parsers/bpmn-parser.js";
import { ValidationError } from "@/shared/errors/types/app-error.js";
import { type IProcessRepository } from "@/shared/interfaces/repositories/IProcessRepository.js";
import {
  type CreateProcessDTO,
  type UpdateProcessDTO,
  type ProcessFilterDTO,
} from "@/shared/types/dtos/process.dto.js";
import { logger } from "@/shared/utils/logger.js";

import { type ProcessStatus } from "../types/process.types.js";
import { convertProcessToDTO } from "../utils/process.utils.js";

export class ProcessService {
  constructor(
    private readonly processRepository: IProcessRepository,
    private readonly bpmnEngine: BPMNEngine
  ) {}

  public async createProcess(data: CreateProcessDTO, userId: Types.ObjectId) {
    try {
      const process = await this.processRepository.create(data, userId);

      const parsedBPMN: ParsedBPMN = {
        id: process._id.toString(),
        name: process.name,
        elements: [
          {
            id: "StartEvent_1",
            type: "startEvent",
            name: "Başlangıç",
            outgoing: [],
          },
        ],
      };

      const instance = await this.bpmnEngine.startProcess(parsedBPMN, {
        processId: process._id,
        userId,
      });

      const processDTO = convertProcessToDTO(process);
      return {
        ...processDTO,
        instanceId: instance.id,
      };
    } catch (error: unknown) {
      logger.error("Süreç oluşturma hatası:", {
        error,
        processName: data.name,
        userId: userId.toString(),
      });

      if (error instanceof Error && error.name === "ValidationError") {
        throw new ValidationError("Geçersiz süreç verisi");
      }
      throw error;
    }
  }

  public async getProcessById(id: string) {
    try {
      const process = await this.processRepository.findById(id);

      if (!process) {
        throw new ValidationError(`${id} ID'li süreç bulunamadı`);
      }

      let engineStatus = "unknown";
      try {
        engineStatus = this.bpmnEngine.getInstanceStatus(
          `PROC_${process._id.toString()}`
        );
      } catch (error: unknown) {
        logger.warn("Motor durum hatası:", {
          error,
          processId: id,
          timestamp: new Date().toISOString(),
        });
        engineStatus = "not_started";
      }

      const processDTO = convertProcessToDTO(process);
      return {
        ...processDTO,
        engineStatus,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "CastError") {
        throw new ValidationError("Geçersiz süreç ID formatı");
      }
      throw error;
    }
  }

  public async getProcesses(filters: ProcessFilterDTO) {
    const result = await this.processRepository.findAll(filters);
    return {
      processes: result.processes.map(convertProcessToDTO),
      pagination: {
        total: result.total,
        page: filters.page || 0,
        limit: filters.limit || 10,
        pages: Math.ceil(result.total / (filters.limit || 10)),
      },
    };
  }

  public async updateProcess(
    id: string,
    data: UpdateProcessDTO,
    userId: Types.ObjectId
  ) {
    try {
      const existingProcess = await this.processRepository.findById(id);
      if (!existingProcess) {
        throw new ValidationError(`${id} ID'li süreç bulunamadı`);
      }

      const process = await this.processRepository.update(id, data, userId);
      return convertProcessToDTO(process);
    } catch (error: any) {
      if (error.name === "CastError") {
        throw new ValidationError("Geçersiz süreç ID formatı");
      }
      throw error;
    }
  }

  public async deleteProcess(id: string) {
    try {
      const process = await this.processRepository.findById(id);
      if (!process) {
        throw new ValidationError(`${id} ID'li süreç bulunamadı`);
      }

      try {
        const instanceId = `PROC_${process._id.toString()}`;
        await this.bpmnEngine.stopInstance(instanceId);
      } catch (error) {
        logger.warn("Engine stop error:", {
          error,
          processId: id,
        });
      }

      await this.processRepository.delete(id);
      return { message: "Süreç başarıyla silindi" };
    } catch (error: any) {
      if (error.name === "CastError") {
        throw new ValidationError("Geçersiz süreç ID formatı");
      }
      throw error;
    }
  }

  public async updateProcessStatus(id: string, status: string): Promise<void> {
    try {
      const process = await this.processRepository.findById(id);
      if (!process) {
        throw new ValidationError(`${id} ID'li süreç bulunamadı`);
      }

      const instanceId = `PROC_${process._id.toString()}`;
      await this.bpmnEngine.updateInstanceStatus(instanceId, status);

      if (!["active", "inactive", "archived"].includes(status)) {
        throw new ValidationError("Geçersiz süreç durumu");
      }

      await this.processRepository.update(
        id,
        {
          status: status as ProcessStatus,
        },
        process.createdBy
      );
    } catch (error: unknown) {
      logger.error("Süreç durum güncelleme hatası:", {
        error,
        processId: id,
        status,
      });
      if (error instanceof Error && error.name === "CastError") {
        throw new ValidationError("Geçersiz süreç ID formatı");
      }
      throw error;
    }
  }
}
