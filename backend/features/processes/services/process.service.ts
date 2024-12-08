import { Types } from "mongoose";
import {
  CreateProcessDTO,
  UpdateProcessDTO,
  ProcessFilterDTO,
} from "@/shared/types/dtos/process.dto";
import { IProcessRepository } from "@/shared/interfaces/repositories/IProcessRepository";
import { ValidationError } from "@/shared/errors/types/app-error";
import { convertProcessToDTO } from "../utils/process.utils";
import { BPMNEngine } from "@/core/bpmn/engine/bpmn-engine";
import { ParsedBPMN } from "@/core/bpmn/parsers/bpmn-parser";
import { logger } from "@/shared/utils/logger";
import { ProcessStatus } from "../types/process.types";

export class ProcessService {
  constructor(
    private processRepository: IProcessRepository,
    private bpmnEngine: BPMNEngine
  ) {}

  async createProcess(data: CreateProcessDTO, userId: Types.ObjectId) {
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
        userId: userId,
      });

      const processDTO = convertProcessToDTO(process);
      return {
        ...processDTO,
        instanceId: instance.id,
      };
    } catch (error: any) {
      logger.error("Process creation error:", {
        error,
        processName: data.name,
        userId: userId.toString(),
      });

      if (error.name === "ValidationError") {
        throw new ValidationError("Geçersiz süreç verisi");
      }
      throw error;
    }
  }

  async getProcessById(id: string) {
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
      } catch (error) {
        logger.warn("Engine status error:", {
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
    } catch (error: any) {
      if (error.name === "CastError") {
        throw new ValidationError("Geçersiz süreç ID formatı");
      }
      throw error;
    }
  }

  async getProcesses(filters: ProcessFilterDTO) {
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

  async updateProcess(
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

  async deleteProcess(id: string) {
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

  async updateProcessStatus(id: string, status: ProcessStatus): Promise<void> {
    try {
      const process = await this.processRepository.findById(id);
      if (!process) {
        throw new ValidationError(`${id} ID'li süreç bulunamadı`);
      }

      const instanceId = `PROC_${process._id.toString()}`;
      try {
        await this.bpmnEngine.updateInstanceStatus(instanceId, status);
      } catch (engineError) {
        logger.error("Süreç durumu güncelleme hatası:", {
          error: engineError,
          processId: id,
          status,
        });
        throw new Error("Süreç durumu güncellenemedi");
      }

      await this.processRepository.update(
        id,
        {
          status,
        },
        process.createdBy
      );

      logger.info("Süreç durumu güncellendi", {
        processId: id,
        status,
        userId: process.createdBy,
      });
    } catch (error: any) {
      if (error.name === "CastError") {
        throw new ValidationError("Geçersiz süreç ID formatı");
      }
      throw error;
    }
  }
}
