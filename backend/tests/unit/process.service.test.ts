import { type Document, Types } from "mongoose";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { bpmnEngine, type BPMNEngine } from "@/core/bpmn/engine/bpmn-engine";
import { type ProcessFilterDTO } from "@/features/processes/dtos/process-filter.dto";
import { type IProcess } from "@/features/processes/models/process.model";
import { ProcessStatus } from "@/features/processes/types/process.types";
import { ProcessService } from "@/features/processes/services/process.service";
import { type BPMNProcessDefinition } from "@/features/processes/types/process.types";
import { ERROR_MESSAGES } from "@/shared/constants/error-messages";
import {
  createMockProcess,
  createMockProcessResult,
  createMockUpdateProcessDTO,
} from "../helpers/process.fixtures";
import { ValidationError } from "@/shared/errors/types/app-error";
import { ProcessInstanceStatus } from "@/core/bpmn/types/process.types";
import { logger } from "@/shared/utils/logger";
import { TechnicalError } from "@/shared/errors/types/app-error";
import { type IProcessRepository } from "@/shared/interfaces/repositories/IProcessRepository";

interface MockBPMNEngine extends BPMNEngine {
  startProcess: Mock;
  stopInstance: Mock;
  getInstanceStatus: Mock;
  updateInstanceStatus: Mock;
  executeTask: Mock;
}

interface MockRepository extends IProcessRepository {
  findById: Mock;
  findByName: Mock;
  findAll: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  exists: Mock;
}

// vi.mock çağrıları en üstte olmalı
vi.mock("@/shared/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("@/infrastructure/database/mongodb/repositories/ProcessRepository");
vi.mock("@/core/bpmn/engine/bpmn-engine");

describe("ProcessService", () => {
  let processService: ProcessService;
  let processRepository: MockRepository;
  let bpmnEngine: MockBPMNEngine;
  let mockProcessId: string;

  // Test verilerini tanımlama
  const mockProcessDTO = {
    name: "Test Süreci",
    description: "Test süreç açıklaması",
    bpmnXml:
      "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>",
  };

  beforeEach(() => {
    mockProcessId = new Types.ObjectId().toString();

    processRepository = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };

    bpmnEngine = {
      startProcess: vi.fn(),
      stopInstance: vi.fn(),
      getInstanceStatus: vi.fn(),
      updateInstanceStatus: vi.fn(),
      executeTask: vi.fn(),
    };

    processService = new ProcessService(
      processRepository as any,
      bpmnEngine as any,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("deleteProcess", () => {
    const mockProcessId = new Types.ObjectId().toString();

    it("should delete process successfully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.DRAFT,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      processRepository.delete.mockResolvedValue(undefined);
      bpmnEngine.stopInstance.mockResolvedValue(undefined);

      await processService.deleteProcess(mockProcessId);

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(processRepository.delete).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.stopInstance).toHaveBeenCalledWith(
        `PROC_${mockProcessId}`,
      );
    });
  });

  describe("createProcess", () => {
    it("should create a new process successfully", async () => {
      const mockProcess = createMockProcess({
        ...mockProcessDTO,
        _id: new Types.ObjectId(),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findByName.mockResolvedValue(null);
      processRepository.create.mockResolvedValue(mockProcess);
      bpmnEngine.startProcess.mockResolvedValue(undefined);

      const result = await processService.createProcess(
        mockProcessDTO,
        new Types.ObjectId(),
      );

      expect(processRepository.findByName).toHaveBeenCalledWith(
        mockProcessDTO.name,
      );
      expect(processRepository.create).toHaveBeenCalled();
      expect(bpmnEngine.startProcess).toHaveBeenCalled();
      expect(result).toMatchObject(mockProcess);
    });

    it("should throw ValidationError when process name already exists", async () => {
      processRepository.findByName.mockResolvedValue({} as IProcess);

      await expect(
        processService.createProcess(mockProcessDTO, new Types.ObjectId()),
      ).rejects.toThrow(ERROR_MESSAGES.PROCESS.NAME_EXISTS);
    });

    it("should handle process creation error gracefully", async () => {
      processRepository.create.mockRejectedValue(
        new Error(ERROR_MESSAGES.PROCESS.CREATION_FAILED),
      );

      await expect(
        processService.createProcess(mockProcessDTO, new Types.ObjectId()),
      ).rejects.toThrow(ERROR_MESSAGES.PROCESS.CREATION_FAILED);
    });

    // Test düzeltmesi
    it("should handle process creation error with empty error object", async () => {
      processRepository.findByName.mockResolvedValue(null);
      processRepository.create.mockRejectedValue({});

      await expect(
        processService.createProcess(mockProcessDTO, new Types.ObjectId()),
      ).rejects.toThrow(ERROR_MESSAGES.PROCESS.CREATION_FAILED);

      expect(logger.error).toHaveBeenCalledWith(
        "Süreç oluşturma hatası:",
        expect.objectContaining({}),
      );
    });

    it("should handle multiple process creation errors", async () => {
      const errors = [
        {},
        new Error("Test error"),
        new ValidationError("Test validation"),
      ];

      for (const error of errors) {
        processRepository.create.mockRejectedValue(error);

        await expect(
          processService.createProcess(
            {
              name: "Test Süreci",
              description: "Test süreç açıklaması",
              bpmnXml:
                "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>",
            },
            new Types.ObjectId(),
          ),
        ).rejects.toThrow();
      }
    });
  });

  describe("updateProcess", () => {
    const mockProcessId = new Types.ObjectId().toString();
    const mockProcess = createMockProcess({
      _id: new Types.ObjectId(mockProcessId),
      name: "Test Süreci",
      description: "Test açıklama",
      status: ProcessStatus.ACTIVE,
    });

    const mockUpdateData = createMockUpdateProcessDTO({
      name: "Güncellenmiş Süreç",
      description: "Güncellenmiş açıklama",
      status: ProcessStatus.INACTIVE,
      lastUpdated: new Date(),
      updatedAt: new Date(),
    });

    it("should update process successfully", async () => {
      const updatedBy = new Types.ObjectId();
      const mockUpdatedProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        name: "Güncellenmiş Süreç",
        description: "Güncellenmiş açıklama",
        status: ProcessStatus.INACTIVE,
        updatedBy,
      });

      processRepository.findById.mockResolvedValue(mockUpdatedProcess);
      processRepository.update.mockResolvedValue(mockUpdatedProcess);

      const result = await processService.updateProcess(
        mockProcessId,
        mockUpdateData,
        updatedBy,
      );

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(processRepository.update).toHaveBeenCalledWith(
        mockProcessId,
        mockUpdateData,
        updatedBy,
      );
      expect(result!.name).toBe(mockUpdateData.name);
      expect(result!.status).toBe(mockUpdateData.status);
    });

    it("should throw ValidationError when process not found", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(
        processService.updateProcess(
          mockProcessId,
          mockUpdateData,
          new Types.ObjectId(),
        ),
      ).rejects.toThrow(Error);
    });

    it("should throw ValidationError when process name already exists", async () => {
      processRepository.findById.mockResolvedValue({} as IProcess);
      processRepository.update.mockRejectedValue(
        new Error("Bu isimde bir süreç zaten var"),
      );

      await expect(
        processService.updateProcess(
          mockProcessId,
          mockUpdateData,
          new Types.ObjectId(),
        ),
      ).rejects.toThrow(Error);
    });

    it("should throw ValidationError if process with same name exists", async () => {
      // Mevcut süreç
      const existingProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        name: "Mevcut Süreç",
        createdBy: new Types.ObjectId(),
      });

      // Aynı isimle başka bir süreç
      const duplicateProcess = createMockProcess({
        _id: new Types.ObjectId(), // Farklı ID
        name: "Test Süreci", // Güncellenecek isim
        createdBy: new Types.ObjectId(),
      });

      // Mock ayarlamaları
      processRepository.findById.mockResolvedValue(existingProcess);
      processRepository.findByName.mockResolvedValue(duplicateProcess);

      const updateData = {
        name: "Test Süreci", // duplicateProcess ile aynı isim
        lastUpdated: new Date(),
        updatedAt: new Date(),
      };

      await expect(
        processService.updateProcess(
          mockProcessId,
          updateData,
          existingProcess.createdBy,
        ),
      ).rejects.toThrow(ValidationError);

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(processRepository.findByName).toHaveBeenCalledWith(
        updateData.name,
      );
    });

    it("should allow update if name is unchanged", async () => {
      const processId = new Types.ObjectId();
      const existingProcess = createMockProcess({
        _id: processId,
        name: "Test Process",
        description: "Test Description",
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(existingProcess);
      processRepository.findByName.mockResolvedValue(existingProcess);
      processRepository.update.mockResolvedValue(existingProcess);

      const unchangedNameData = createMockUpdateProcessDTO({
        name: "Test Process",
        description: "Updated Description",
      });

      await expect(
        processService.updateProcess(
          processId.toString(),
          unchangedNameData,
          new Types.ObjectId(),
        ),
      ).resolves.not.toThrow();
    });
  });

  describe("getProcessById", () => {
    const mockProcessId = new Types.ObjectId().toString();

    it("should get process by id successfully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        name: "Test Süreci",
        description: "Test süreç açıklaması",
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.getInstanceStatus.mockReturnValue(ProcessStatus.ACTIVE);

      const result = await processService.getProcessById(mockProcessId);

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.getInstanceStatus).toHaveBeenCalledWith(
        `PROC_${mockProcessId}`,
      );
      expect(result).toMatchObject({
        id: mockProcessId,
        status: ProcessStatus.ACTIVE,
        engineStatus: ProcessStatus.ACTIVE,
      });
    });

    it("should handle engine status error gracefully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.getInstanceStatus.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.ENGINE.ERROR);
      });

      const result = await processService.getProcessById(mockProcessId);
      if (!result) throw new Error("Result should be defined");

      expect(result.engineStatus).toBe("not_started");
    });

    it("should handle engine status error with empty error object", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.getInstanceStatus.mockRejectedValue({});

      const result = await processService.getProcessById(mockProcessId);
      if (!result) throw new Error("Result should be defined");

      expect(result.engineStatus).toBe("not_started");
    });

    it("should handle multiple engine status errors", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.getInstanceStatus.mockRejectedValue({});

      const result = await processService.getProcessById(
        mockProcess._id.toString(),
      );
      if (!result) throw new Error("Result should be defined");

      expect(result.engineStatus).toBe("not_started");
    });
  });

  describe("getProcesses", () => {
    const mockFilters: ProcessFilterDTO = {
      status: "active",
      page: 0,
      limit: 10,
    };

    it("should get processes list successfully", async () => {
      const mockProcesses = [
        createMockProcess({
          name: "Test Süreci 1",
          status: ProcessStatus.ACTIVE,
        }),
        createMockProcess({
          name: "Test Süreci 2",
          status: ProcessStatus.ACTIVE,
        }),
      ];

      const mockResult = createMockProcessResult(mockProcesses);
      processRepository.findAll.mockResolvedValue(mockResult);

      const result = await processService.getProcesses(mockFilters);
      if (!result) throw new Error("Result should be defined");

      expect(result.processes).toHaveLength(2);
      expect(result.pagination).toEqual({
        total: 2,
        page: 0,
        limit: 10,
        pages: 1,
      });
    });

    it("should return empty list when no processes found", async () => {
      processRepository.findAll.mockResolvedValue({
        processes: [],
        total: 0,
      });

      const result = await processService.getProcesses(mockFilters);
      if (!result) throw new Error("Result should be defined");

      expect(result.processes).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("should return filtered processes", async () => {
      const filters: ProcessFilterDTO = {
        status: "active",
        search: "test",
      };
      const processes = [
        createMockProcess({
          name: "Test Süreci 1",
          description: "Test süreç açıklaması 1",
          status: ProcessStatus.ACTIVE,
        }),
        createMockProcess({
          name: "Test Süreci 2",
          description: "Test süreç açıklaması 2",
          status: ProcessStatus.ACTIVE,
        }),
      ];
      processRepository.findAll.mockResolvedValue({
        processes,
        total: processes.length,
      });

      const result = await processService.getProcesses(filters);
      if (!result) throw new Error("Result should be defined");

      expect(result.processes).toHaveLength(2);
      expect(result.pagination).toEqual({
        total: 2,
        page: 0,
        limit: 10,
        pages: 1,
      });
      expect(processRepository.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe("updateProcessStatus", () => {
    const mockProcessId = new Types.ObjectId().toString();

    it("should update process status successfully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      processRepository.update.mockResolvedValue(mockProcess);
      bpmnEngine.updateInstanceStatus.mockResolvedValue(undefined);

      await processService.updateProcessStatus(mockProcessId, "inactive");

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.updateInstanceStatus).toHaveBeenCalledWith(
        `PROC_${mockProcessId}`,
        "INACTIVE",
      );
      expect(processRepository.update).toHaveBeenCalledWith(
        mockProcessId,
        expect.objectContaining({
          status: "inactive",
          updatedAt: expect.any(Date),
          lastUpdated: expect.any(Date),
        }),
        mockProcess._id,
      );
    });

    it("should throw ValidationError when process not found", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(
        processService.updateProcessStatus(mockProcessId, "active"),
      ).rejects.toThrow(ERROR_MESSAGES.PROCESS.NOT_FOUND);
    });

    it("should handle engine errors gracefully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.updateInstanceStatus.mockRejectedValue(
        new Error(ERROR_MESSAGES.ENGINE.UPDATE_FAILED),
      );

      await expect(
        processService.updateProcessStatus(mockProcessId, "inactive"),
      ).rejects.toThrow(ERROR_MESSAGES.ENGINE.UPDATE_FAILED);
    });

    it("should throw ValidationError for invalid status", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);

      await expect(
        processService.updateProcessStatus(mockProcessId, "invalid_status"),
      ).rejects.toThrow(ERROR_MESSAGES.PROCESS.INVALID_STATUS);
    });

    it("should handle multiple engine errors gracefully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.updateInstanceStatus.mockRejectedValue(new Error());

      await expect(
        processService.updateProcessStatus(mockProcessId, "inactive"),
      ).rejects.toThrow();

      expect(processRepository.update).not.toHaveBeenCalled();
    });

    it("should handle status update error with empty error object", async () => {
      const mockProcess = createMockProcess();

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.updateInstanceStatus.mockRejectedValue({});

      await expect(
        processService.updateProcessStatus(
          mockProcessId,
          ProcessStatus.INACTIVE,
        ),
      ).rejects.toThrow(ERROR_MESSAGES.ENGINE.UPDATE_FAILED);

      expect(logger.error).toHaveBeenCalledWith(
        "Process updateStatus error:",
        expect.objectContaining({}),
      );
    });

    it("should handle multiple status update errors", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);

      const errors = [
        {},
        new Error("Test error"),
        new ValidationError("Test validation"),
      ];

      for (const error of errors) {
        bpmnEngine.updateInstanceStatus.mockRejectedValue(error);

        await expect(
          processService.updateProcessStatus(
            mockProcess._id.toString(),
            "inactive",
          ),
        ).rejects.toThrow();
      }
    });

    it("should handle engine status update error", async () => {
      const mockProcessId = new Types.ObjectId().toString();
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.updateInstanceStatus.mockRejectedValue(
        new Error(ERROR_MESSAGES.ENGINE.UPDATE_FAILED),
      );

      await expect(
        processService.updateProcessStatus(
          mockProcessId,
          ProcessStatus.INACTIVE,
        ),
      ).rejects.toThrow(ERROR_MESSAGES.ENGINE.UPDATE_FAILED);

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.updateInstanceStatus).toHaveBeenCalled();
    });
  });

  describe("getProcessStatus", () => {
    it("should return process status successfully", async () => {
      const mockProcessId = "test-process-id";
      bpmnEngine.getInstanceStatus.mockResolvedValue({
        status: ProcessStatus.ACTIVE,
      });

      const result = await processService.getProcessStatus(mockProcessId);

      expect(result).toBe(ProcessStatus.ACTIVE);
      expect(bpmnEngine.getInstanceStatus).toHaveBeenCalledWith(mockProcessId);
    });

    it("should handle engine status error gracefully", async () => {
      const mockProcessId = new Types.ObjectId().toString();
      bpmnEngine.getInstanceStatus.mockRejectedValue(
        new Error(ERROR_MESSAGES.ENGINE.ERROR),
      );

      await expect(
        processService.getProcessStatus(mockProcessId),
      ).rejects.toThrow(ERROR_MESSAGES.ENGINE.ERROR);
    });
  });

  describe("Instance Management", () => {
    const mockProcessId = new Types.ObjectId().toString();

    it("should create process instance successfully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.ACTIVE,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      const expectedInstanceId = `PROC_${mockProcessId}`;

      bpmnEngine.startProcess.mockResolvedValue({
        id: expectedInstanceId,
        processId: mockProcessId,
        status: ProcessInstanceStatus.ACTIVE,
        currentElement: { id: "start", type: "startEvent", outgoing: [] },
        variables: {},
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await processService.createProcessInstance(mockProcessId);
      if (!result) throw new Error("Result should be defined");

      expect(result.instanceId).toBe(expectedInstanceId);
      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
    });

    it("should throw error when creating instance for invalid process", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(
        processService.createProcessInstance(mockProcessId),
      ).rejects.toThrow(ERROR_MESSAGES.PROCESS.NOT_FOUND);
    });

    it("should save instance state successfully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.getInstanceStatus.mockResolvedValue({
        status: ProcessInstanceStatus.ACTIVE,
        currentStepId: "step1",
      });

      await processService.saveInstanceState(mockProcessId);

      expect(processRepository.update).toHaveBeenCalled();
    });

    it("should handle instance creation error with validation error", async () => {
      const mockProcess = createMockProcess();
      const validationError = new ValidationError("Test validation error");

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.startProcess.mockRejectedValue(validationError);

      await expect(
        processService.createProcessInstance(mockProcessId),
      ).rejects.toThrow(ValidationError);

      // Logger kontrolünü güncelle
      expect(logger.error).toHaveBeenCalledWith(
        "Process createInstance error:",
        expect.objectContaining({
          domain: "Process",
          action: "createInstance",
          resourceId: expect.any(String),
          error: expect.any(ValidationError),
          timestamp: expect.any(Date),
        }),
      );
    });

    it("should handle multiple instance creation errors", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(),
      });

      processRepository.findById.mockResolvedValue(mockProcess);

      const errors = [
        new ValidationError("Test validation"),
        new Error("Test error"),
        {},
      ];

      for (const error of errors) {
        bpmnEngine.startProcess.mockRejectedValue(error);

        await expect(
          processService.createProcessInstance(mockProcess._id.toString()),
        ).rejects.toThrow();
      }
    });
  });

  it("should get processes with pagination", async () => {
    const mockProcesses = [createMockProcess(), createMockProcess()];
    const mockResult = createMockProcessResult(mockProcesses);

    processRepository.findAll.mockResolvedValue(mockResult);

    const result = await processService.getProcesses({});
    if (!result) throw new Error("Result should be defined");

    expect(result).toBeDefined();
    expect(result.processes).toHaveLength(2);
    expect(result.pagination.total).toBe(2);
  });

  it("should return empty list when no processes found", async () => {
    processRepository.findAll.mockResolvedValue({
      processes: [],
      total: 0,
    });

    const result = await processService.getProcesses({});
    if (!result) throw new Error("Result should be defined");

    expect(result.processes).toHaveLength(0);
    expect(result.pagination.total).toBe(0);
  });

  it("should update process status", async () => {
    const mockProcess = createMockProcess();
    const updatedProcess = {
      ...mockProcess,
      status: ProcessStatus.COMPLETED,
    };

    processRepository.findById.mockResolvedValue(mockProcess);
    processRepository.update.mockResolvedValue(updatedProcess);

    const result = await processService.updateProcess(
      mockProcess._id.toString(),
      createMockUpdateProcessDTO({ status: ProcessStatus.COMPLETED }),
      new Types.ObjectId(),
    );
    if (!result) throw new Error("Result should be defined");

    expect(result).toBeDefined();
    expect(result.status).toBe(ProcessStatus.COMPLETED);
  });
});
