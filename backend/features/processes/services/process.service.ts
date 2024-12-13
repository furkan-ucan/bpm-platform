import { type Types } from "mongoose";

import { type BPMNEngine } from "@/core/bpmn/engine/bpmn-engine";
import { type ParsedBPMN } from "@/core/bpmn/parsers/bpmn-parser";
import { ValidationError } from "@/shared/errors/common/validation.error";
import { type IProcessRepository } from "@/shared/interfaces/repositories/IProcessRepository";
import {
  type CreateProcessDTO,
  type UpdateProcessDTO,
  type ProcessFilterDTO,
  ProcessResponseDTO,
} from "@/shared/types/dtos/process.dto";
import { logger } from "@/shared/utils/logger";

import { ProcessStatus, StepStatus } from "../types/process.types.js";
import { convertProcessToDTO } from "../utils/process.utils.js";
import { parseBPMNXml } from "@/core/bpmn/parsers/bpmn-parser";
import { type ProcessContext } from "@/core/bpmn/types/process.types";
import { ProcessInstanceStatus } from "@/core/bpmn/types/process.types";
import {
  type ProcessHistoryEntry,
  BPMNHistoryEntry,
} from "@/core/bpmn/types/instance.types";
import { ProcessValidator } from "../validators/process.validator";
import { NotFoundError } from "@/shared/errors/common/not-found.error";
import { DomainErrorHandler } from "@/shared/errors/handlers/error-handler";
import { ProcessMapper } from "../mappers/process.mapper";
import { IProcess } from "../models/process.model.js";
import { AppError } from "@/shared/errors/base/app-error";
import { BusinessError } from "@/shared/errors/common/business.error";
import { ERROR_MESSAGES } from "@/shared/constants/error-messages";
import { TechnicalError } from "@/shared/errors/common/technical.error";
import { ProcessOperationError, ProcessNotFoundError } from '../errors/process.errors';
import { ProcessAlreadyExistsError } from '../errors/process.errors';

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
    return statusMap[status] || ProcessStatus.INACTIVE;
  }

  private getProcessInstanceStatus(status: ProcessStatus): ProcessInstanceStatus {
    const statusMap: Record<ProcessStatus, ProcessInstanceStatus> = {
      [ProcessStatus.ACTIVE]: ProcessInstanceStatus.ACTIVE,
      [ProcessStatus.INACTIVE]: ProcessInstanceStatus.INACTIVE,
      [ProcessStatus.COMPLETED]: ProcessInstanceStatus.COMPLETED,
      [ProcessStatus.CANCELLED]: ProcessInstanceStatus.FAILED,
      [ProcessStatus.DRAFT]: ProcessInstanceStatus.INACTIVE,
      [ProcessStatus.PENDING]: ProcessInstanceStatus.ACTIVE,
      [ProcessStatus.ARCHIVED]: ProcessInstanceStatus.INACTIVE
    };
    return statusMap[status];
  }

  public async createProcess(
    processDTO: CreateProcessDTO,
    userId: Types.ObjectId,
  ) {
    try {
      const existingProcess = await this.processRepository.findByName(
        processDTO.name,
      );
      if (existingProcess) {
        throw new ValidationError(ERROR_MESSAGES.PROCESS.NAME_EXISTS);
      }

      const process = await this.processRepository.create(processDTO, userId);
      const parsedBpmn = parseBPMNXml(processDTO.bpmnXml);

      await this.bpmnEngine.startProcess(parsedBpmn, {
        processId: process._id.toString(),
        userId: userId.toString(),
        variables: {},
      });

      return ProcessMapper.toDTO(process);
    } catch (error) {
      logger.error("Process creation error:", {
        domain: "Process",
        action: "create",
        processName: processDTO.name,
        userId: userId.toString(),
        error,
        timestamp: new Date()
      });

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      throw new TechnicalError(ERROR_MESSAGES.PROCESS.CREATION_FAILED);
    }
  }

  public async getProcessById(id: string) {
    try {
      const process = await this.processRepository.findById(id);
      if (!process) {
        throw new NotFoundError(`${id} ${ERROR_MESSAGES.PROCESS.NOT_FOUND}`);
      }

      const instanceId = `PROC_${process._id.toString()}`;
      let engineStatus;

      try {
        engineStatus = await this.bpmnEngine.getInstanceStatus(instanceId);
      } catch (error) {
        logger.warn("Process engine status error:", {
          domain: "Process",
          action: "getStatus",
          resourceId: id,
          error,
          timestamp: new Date()
        });
        engineStatus = "not_started";
      }

      return {
        ...ProcessMapper.toDTO(process),
        engineStatus,
      };
    } catch (error) {
      logger.error("Process fetch error:", {
        domain: "Process",
        action: "getById",
        resourceId: id,
        error,
        timestamp: new Date()
      });

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      throw new TechnicalError(ERROR_MESSAGES.ENGINE.ERROR);
    }
  }

  public async getProcesses(filters: ProcessFilterDTO) {
    try {
      const result = await this.processRepository.findAll(filters);
      return {
        processes: result.processes.map((process) =>
          ProcessMapper.toDTO(process),
        ),
        pagination: {
          total: result.total,
          page: filters.page || 0,
          limit: filters.limit || 10,
          pages: Math.ceil(result.total / (filters.limit || 10)),
        },
      };
    } catch (error) {
      logger.error("Process list fetch error:", {
        domain: "Process",
        action: "getAll",
        userId: filters.createdBy?.toString(),
        error,
        timestamp: new Date()
      });

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      throw new TechnicalError(ERROR_MESSAGES.ENGINE.ERROR);
    }
  }
  public async updateProcess(
    id: string,
    updateData: UpdateProcessDTO,
    updatedBy: Types.ObjectId
  ): Promise<IProcess> {
    try {
      const process = await this.processRepository.findById(id);
      if (!process) {
        throw new ValidationError(ERROR_MESSAGES.PROCESS.NOT_FOUND);
      }

      if (updateData.name && updateData.name !== process.name) {
        const existingProcess = await this.processRepository.findByName(updateData.name);
        if (existingProcess && existingProcess._id.toString() !== id) {
          throw new ValidationError(ERROR_MESSAGES.PROCESS.NAME_EXISTS);
        }
      }

      // updatedAt alanını güncelleme verisine ekleyelim
      const updatedProcess = await this.processRepository.update(
        id,
        { ...updateData, updatedAt: new Date() }, // updatedAt burada zorunlu hale getirildi
        updatedBy
      );

      return updatedProcess;
    } catch (error) {
      logger.error("Process update error:", {
        domain: "Process",
        action: "update",
        resourceId: id,
        error,
        timestamp: new Date()
      });

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      throw new ProcessOperationError(ERROR_MESSAGES.PROCESS.UPDATE_FAILED);
    }
  }
  public async deleteProcess(id: string) {
    try {
      const process = await this.processRepository.findById(id);
      if (!process) {
        throw new ProcessNotFoundError(id);
      }

      const instanceId = `PROC_${process._id.toString()}`;
      try {
        await this.bpmnEngine.stopInstance(instanceId);
      } catch (engineError) {
        logger.error("Process delete error:", {
          domain: "Process",
          action: "delete",
          resourceId: id,
          error: engineError,
          timestamp: new Date()
        });
        throw new ProcessOperationError(
          ERROR_MESSAGES.ENGINE.ERROR,
          'TECHNICAL_ERROR'
        );
      }

      await this.processRepository.delete(id);
      return {
        message: ERROR_MESSAGES.PROCESS.DELETE_SUCCESS
      };
    } catch (error) {
      if (error instanceof ProcessOperationError || error instanceof ProcessNotFoundError) {
        throw error;
      }

      logger.error("Process delete error:", {
        domain: "Process",
        action: "delete",
        resourceId: id,
        error,
        timestamp: new Date()
      });

      throw new ProcessOperationError(ERROR_MESSAGES.PROCESS.DELETE_FAILED);
    }
  }

  public async updateProcessStatus(id: string, status: ProcessStatus) {
    try {
      const process = await this.processRepository.findById(id);
      if (!process) {
        throw new NotFoundError(ERROR_MESSAGES.PROCESS.NOT_FOUND);
      }

      const instanceId = `PROC_${process._id.toString()}`;
      await this.bpmnEngine.updateInstanceStatus(
        instanceId,
        this.getProcessInstanceStatus(status)
      );

      await this.processRepository.update(
        id,
        {
          status,
          updatedAt: new Date()
        },
        process.createdBy
      );

      return ProcessMapper.toDTO(process);
    } catch (error) {
      logger.error("Process status update error:", {
        domain: "Process",
        action: "updateStatus",
        resourceId: id,
        error,
        timestamp: new Date()
      });

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      throw new TechnicalError(ERROR_MESSAGES.ENGINE.UPDATE_FAILED);
    }
  }

  public async startProcess(processId: Types.ObjectId, userId: Types.ObjectId) {
    try {
      const process = await this.processRepository.findById(
        processId.toString(),
      );
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
      logger.error("Process start error:", {
        domain: "Process",
        action: "start",
        resourceId: processId.toString(),
        userId: userId.toString(),
        error,
        timestamp: new Date()
      });

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      throw new TechnicalError(ERROR_MESSAGES.ENGINE.ERROR);
    }
  }

  public async getProcessStatus(processId: string): Promise<string> {
    try {
      const instance = await this.bpmnEngine.getInstanceStatus(processId);
      return instance.status;
    } catch (error) {
      logger.error("Process status fetch error:", {
        domain: "Process",
        action: "getStatus",
        resourceId: processId,
        error,
        timestamp: new Date()
      });

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      throw new TechnicalError(ERROR_MESSAGES.ENGINE.ERROR);
    }
  }

  public async saveInstanceState(processId: string): Promise<void> {
    try {
      const process = await this.processRepository.findById(processId);
      if (!process) {
        throw new NotFoundError(ERROR_MESSAGES.PROCESS.NOT_FOUND);
      }

      const instanceId = `PROC_${process._id.toString()}`;
      const instance = await this.bpmnEngine.getInstanceStatus(instanceId);

      await this.processRepository.update(
        processId,
        {
          status: this.mapInstanceStatusToProcessStatus(instance.status),
          updatedAt: new Date()
        },
        process.createdBy
      );

      logger.info("Process instance state saved", {
        processId,
        status: instance.status,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error("Process instance state save error:", {
        domain: "Process",
        action: "saveInstanceState",
        resourceId: processId,
        error,
        timestamp: new Date()
      });

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      throw new TechnicalError(ERROR_MESSAGES.ENGINE.ERROR);
    }
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

  public async getInstanceHistory(
    processId: string,
  ): Promise<ProcessHistoryEntry[]> {
    try {
      const process = await this.processRepository.findById(processId);
      if (!process) {
        throw new NotFoundError(ERROR_MESSAGES.PROCESS.NOT_FOUND);
      }

      const instanceId = `PROC_${process._id.toString()}`;
      const instance = await this.bpmnEngine.getInstanceStatus(instanceId);

      return this.mapInstanceHistoryToProcessHistory(instance.history || []);
    } catch (error) {
      logger.error("Process history fetch error:", {
        domain: "Process",
        action: "getHistory",
        resourceId: processId,
        error,
        timestamp: new Date()
      });

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      throw new TechnicalError(ERROR_MESSAGES.ENGINE.ERROR);
    }
  }

  public async createProcessInstance(
    processId: string,
  ): Promise<{ instanceId: string }> {
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
      logger.error("Process createInstance error:", {
        domain: "Process",
        action: "createInstance",
        resourceId: processId,
        error,
        timestamp: new Date()
      });

      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      throw new TechnicalError(ERROR_MESSAGES.ENGINE.ERROR);
    }
  }
}
