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

import { ProcessStatus, StepStatus } from "../types/process.types.js";
import { convertProcessToDTO } from "../utils/process.utils.js";
import { parseBPMNXml } from "@/core/bpmn/parsers/bpmn-parser.js";
import { type ProcessContext } from "@/core/bpmn/types/process.types.js";
import { ProcessInstanceStatus } from "@/core/bpmn/types/process.types.js";
import {
  type ProcessHistoryEntry,
  BPMNHistoryEntry,
} from "@/core/bpmn/types/instance.types.js";
import { ProcessValidator } from "../validators/process.validator";
import { NotFoundError } from "@/shared/errors/types/app-error.js";
import { DomainErrorHandler } from "@/shared/errors/handlers/error-handler.js";
import { ProcessMapper } from '../mappers/process.mapper';
import { IProcess } from "../models/process.model.js";
import { AppError, BusinessError } from "@/shared/errors/types/app-error.js";
import { ERROR_MESSAGES } from "@/shared/constants/error-messages.js";
import { TechnicalError } from "@/shared/errors/types/app-error.js";

export class ProcessService {
  private processMapper: ProcessMapper;

  constructor(
    private readonly processRepository: IProcessRepository,
    private readonly bpmnEngine: BPMNEngine,
  ) {
    this.processMapper = new ProcessMapper();
  }

  private mapInstanceStatusToProcessStatus(
    status: ProcessInstanceStatus,
  ): ProcessStatus {
    const statusMap: Record<ProcessInstanceStatus, ProcessStatus> = {
      [ProcessInstanceStatus.ACTIVE]: ProcessStatus.ACTIVE,
      [ProcessInstanceStatus.INACTIVE]: ProcessStatus.INACTIVE,
      [ProcessInstanceStatus.COMPLETED]: ProcessStatus.COMPLETED,
      [ProcessInstanceStatus.SUSPENDED]: ProcessStatus.INACTIVE,
      [ProcessInstanceStatus.FAILED]: ProcessStatus.CANCELLED,
    };
    return statusMap[status];
  }

  public async createProcess(
    processDTO: CreateProcessDTO,
    userId: Types.ObjectId,
  ) {
    try {
      const existingProcess = await this.processRepository.findByName(processDTO.name);
      if (existingProcess) {
        throw new ValidationError(ERROR_MESSAGES.PROCESS.NAME_EXISTS);
      }

      const process = await this.processRepository.create(processDTO, userId);

      try {
        const parsedBpmn = parseBPMNXml(processDTO.bpmnXml);
        await this.bpmnEngine.startProcess(parsedBpmn, {
          processId: process._id.toString(),
          userId: userId.toString(),
          variables: {}
        });
      } catch (error) {
        logger.error('BPMN Engine hatası:', { error, processId: process._id });
        throw new BusinessError(ERROR_MESSAGES.PROCESS.CREATION_FAILED);
      }

      return process;
    } catch (error) {
      logger.error('Süreç oluşturma hatası:', {
        error,
        processName: processDTO.name,
        userId: userId.toString()
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new BusinessError(ERROR_MESSAGES.PROCESS.CREATION_FAILED);
    }
  }

  public async getProcessById(id: string) {
    try {
      const process = await this.processRepository.findById(id);
      if (!process) {
        throw new NotFoundError(`${id} ID'li süreç bulunamadı`);
      }

      const instanceId = `PROC_${process._id.toString()}`;
      let engineStatus;

      try {
        engineStatus = await this.bpmnEngine.getInstanceStatus(instanceId);
      } catch (error) {
        logger.warn("Motor durum hatası:", {
          error,
          processId: id,
          timestamp: new Date(),
        });
        engineStatus = "not_started";
      }

      return {
        ...ProcessMapper.toDTO(process),
        engineStatus,
      };
    } catch (error) {
      DomainErrorHandler.handle(error, {
        domain: 'Process',
        action: 'getById',
        resourceId: id
      });
    }
  }

  public async getProcesses(filters: ProcessFilterDTO) {
    try {
      const result = await this.processRepository.findAll(filters);
      return {
        processes: result.processes.map(process => ProcessMapper.toDTO(process)),
        pagination: {
          total: result.total,
          page: filters.page || 0,
          limit: filters.limit || 10,
          pages: Math.ceil(result.total / (filters.limit || 10)),
        },
      };
    } catch (error) {
      DomainErrorHandler.handle(error, {
        domain: 'Process',
        action: 'getAll',
        userId: filters.createdBy
      });
    }
  }

  public async updateProcess(
    id: string,
    data: UpdateProcessDTO,
    userId: Types.ObjectId,
  ) {
    try {
      ProcessValidator.validateUpdateData(data);

      const existingProcess = await this.processRepository.findById(id);
      if (!existingProcess) {
        throw new NotFoundError(`${id} ID'li süreç bulunamadı`);
      }

      if (data.name && data.name !== existingProcess.name) {
        const processWithSameName = await this.processRepository.findByName(data.name);
        if (processWithSameName && processWithSameName._id.toString() !== id) {
          throw new ValidationError(ERROR_MESSAGES.PROCESS.NAME_EXISTS);
        }
      }

      const process = await this.processRepository.update(id, data, userId);
      return ProcessMapper.toDTO(process);
    } catch (error) {
      DomainErrorHandler.handle(error, {
        domain: 'Process',
        action: 'update',
        resourceId: id,
        userId: userId.toString()
      });
    }
  }

  public async deleteProcess(id: string) {
    try {
      const process = await this.processRepository.findById(id);
      if (!process) {
        throw new NotFoundError(`${id} ID'li süreç bulunamadı`);
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
    } catch (error) {
      DomainErrorHandler.handle(error, {
        domain: 'Process',
        action: 'delete',
        resourceId: id
      });
    }
  }

  public async updateProcessStatus(id: string, status: string): Promise<void> {
    let process: IProcess | null = null;
    try {
      process = await this.processRepository.findById(id);
      if (!process) {
        throw new NotFoundError(ERROR_MESSAGES.PROCESS.NOT_FOUND);
      }

      if (!["active", "inactive", "archived"].includes(status)) {
        throw new ValidationError(ERROR_MESSAGES.PROCESS.INVALID_STATUS);
      }

      const instanceId = `PROC_${process._id.toString()}`;
      try {
        await this.bpmnEngine.updateInstanceStatus(
          instanceId,
          status.toUpperCase() as ProcessInstanceStatus
        );
      } catch (error) {
        throw new TechnicalError(ERROR_MESSAGES.ENGINE.UPDATE_FAILED);
      }

      await this.processRepository.update(
        id,
        {
          status: status as ProcessStatus,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
        process._id
      );
    } catch (error) {
      DomainErrorHandler.handle(error, {
        domain: 'Process',
        action: 'updateStatus',
        resourceId: id,
        userId: process?._id.toString()
      });
    }
  }

  public async startProcess(processId: Types.ObjectId, userId: Types.ObjectId) {
    try {
      const process = await this.processRepository.findById(processId.toString());
      if (!process) {
        throw new NotFoundError(ERROR_MESSAGES.PROCESS.NOT_FOUND);
      }

      const parsedBpmn = parseBPMNXml(process.bpmnXml);
      const context: ProcessContext = {
        processId: processId.toString(),
        userId: userId.toString(),
        variables: {},
      };

      const instance = await this.bpmnEngine.startProcess(parsedBpmn, context);
      return instance;
    } catch (error) {
      DomainErrorHandler.handle(error, {
        domain: 'Process',
        action: 'start',
        resourceId: processId.toString(),
        userId: userId.toString()
      });
    }
  }

  public async getProcessStatus(processId: string): Promise<string> {
    const instance = await this.bpmnEngine.getInstanceStatus(processId);
    return instance.status;
  }

  public async saveInstanceState(processId: string): Promise<void> {
    const process = await this.processRepository.findById(processId);
    if (!process) {
      throw new ValidationError("Süreç bulunamadı");
    }

    const instanceId = `PROC_${process._id.toString()}`;
    const instance = await this.bpmnEngine.getInstanceStatus(instanceId);

    // Sadece gerekli alanları güncelle
    await this.processRepository.update(
      processId,
      {
        status: this.mapInstanceStatusToProcessStatus(instance.status),
        updatedAt: new Date(),
        lastUpdated: new Date(),
      },
      process.createdBy,
    );

    logger.info("Process instance state saved", {
      processId,
      status: instance.status,
      timestamp: new Date(),
    });
  }

  private mapInstanceHistoryToProcessHistory(
    history: BPMNHistoryEntry[],
  ): ProcessHistoryEntry[] {
    return history.map((entry) => ({
      elementId: entry.stepId,
      type: "process_event",
      action: entry.action,
      timestamp: entry.timestamp,
      userId: entry.userId || "",
      stepId: entry.stepId,
      data: entry.data,
      status: "pending" as StepStatus,
    }));
  }

  public async getInstanceHistory(processId: string): Promise<ProcessHistoryEntry[]> {
    try {
      const process = await this.processRepository.findById(processId);
      if (!process) {
        throw new NotFoundError(ERROR_MESSAGES.PROCESS.NOT_FOUND);
      }

      const instanceId = `PROC_${process._id.toString()}`;
      const instance = await this.bpmnEngine.getInstanceStatus(instanceId);

      return this.mapInstanceHistoryToProcessHistory(instance.history || []);
    } catch (error) {
      DomainErrorHandler.handle(error, {
        domain: 'Process',
        action: 'getHistory',
        resourceId: processId
      });
      return [];
    }
  }

  public async createProcessInstance(processId: string): Promise<{ instanceId: string }> {
    try {
      const process = await this.processRepository.findById(processId);
      if (!process) {
        throw new NotFoundError(ERROR_MESSAGES.PROCESS.NOT_FOUND);
      }

      const instanceId = `PROC_${processId}`;
      const parsedBpmn = parseBPMNXml(process.bpmnXml);

      const context: ProcessContext = {
        processId: processId,
        userId: process.createdBy.toString(),
        variables: {},
      };

      const instance = await this.bpmnEngine.startProcess(parsedBpmn, context);

      return {
        instanceId: instance.id,
      };
    } catch (error) {
      DomainErrorHandler.handle(error, {
        domain: 'Process',
        action: 'createInstance',
        resourceId: processId
      });
      throw new TechnicalError(ERROR_MESSAGES.PROCESS.CREATION_FAILED);
    }
  }
}
