import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Types } from "mongoose";

import { ProcessService } from "../../features/processes/services/process.service";
import { ERROR_MESSAGES } from "../../monitoring/logging/providers/winston.logger";
import { ValidationError } from "../../shared/errors/types/app-error";
import { createMockProcess } from "../helpers/process.fixtures";

import type { BPMNEngine } from "../../core/bpmn/engine/bpmn-engine";
import type { ProcessFilterDTO } from "../../features/processes/dtos/process-filter.dto";
import type { IProcess } from "../../features/processes/models/process.model";
import type { ProcessStatus } from "../../features/processes/types/process.types";
import type { ProcessRepository } from "../../infrastructure/database/mongodb/repositories/ProcessRepository";

// Test interface'ini güncelle
type MockRepository = {
  findById: ReturnType<typeof vi.fn>;
  findByName: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  findAll: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  updateStatus: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  exists: ReturnType<typeof vi.fn>;
};

type MockBPMNEngine = {
  startProcess: ReturnType<typeof vi.fn>;
  stopInstance: ReturnType<typeof vi.fn>;
  getInstanceStatus: ReturnType<typeof vi.fn>;
  updateInstanceStatus: ReturnType<typeof vi.fn>;
  instances: Map<string, any>;
};

vi.mock("@/infrastructure/database/mongodb/repositories/ProcessRepository");
vi.mock("@/core/bpmn/engine/bpmn-engine");
vi.mock("../../monitoring/logging/providers/winston.logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  ERROR_MESSAGES: {
    PROCESS_NOT_FOUND: "Süreç bulunamadı",
    INVALID_PROCESS_ID: "Geçersiz süreç ID formatı",
    PROCESS_NAME_EXISTS: "Bu isimde bir süreç zaten var",
    INVALID_PROCESS_STATUS: "Geçersiz süreç durumu",
    INVALID_STATUS_TRANSITION: "Geçersiz durum geçişi",
    ENGINE_ERROR: "Motor hatası",
    PROCESS_UPDATE_FAILED: "Süreç güncellenemedi",
    VALIDATION_ERROR: "Doğrulama hatası"
  }
}));

// Geçerli durum geçişleri için sabit tanımlayalım
const VALID_STATUS_TRANSITIONS = {
  pending: ["active"],
  active: ["inactive", "archived"],
  inactive: ["active", "archived"],
  archived: []
} as const;

describe("ProcessService", () => {
  let processService: ProcessService;
  let processRepository: MockRepository;
  let bpmnEngine: MockBPMNEngine;

  const mockProcessData = {
    name: "Test Süreci",
    description: "Test süreç açıklaması",
    bpmnXml:
      "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>",
  };

  const mockUserId = new Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();

    processRepository = {
      findById: vi.fn(),
      findByName: vi.fn(),
      find: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    } as MockRepository;

    bpmnEngine = {
      startProcess: vi.fn(),
      stopInstance: vi.fn(),
      getInstanceStatus: vi.fn(),
      updateInstanceStatus: vi.fn(),
      instances: new Map(),
    } as unknown as MockBPMNEngine;

    processService = new ProcessService(processRepository, bpmnEngine as unknown as BPMNEngine);
  });

  describe("createProcess", () => {
    it("should create a new process successfully", async () => {
      const mockCreatedProcess = createMockProcess({
        name: "Test Süreci",
        description: "Test süreç açıklaması",
        createdBy: mockUserId,
        updatedBy: mockUserId,
      });

      // Mock implementations
      processRepository.create.mockResolvedValue(mockCreatedProcess);
      bpmnEngine.startProcess.mockResolvedValue({
        id: "test-instance",
        processId: mockCreatedProcess._id.toString(),
        currentElement: {
          id: "StartEvent_1",
          type: "startEvent",
          name: "Başlangıç",
        },
        status: "active",
        variables: {},
        history: [],
        createdAt: new Date(),
      });

      const result = await processService.createProcess(
        mockProcessData,
        mockUserId,
      );

      expect(processRepository.create).toHaveBeenCalledWith(
        mockProcessData,
        mockUserId,
      );
      expect(bpmnEngine.startProcess).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(mockProcessData.name);
      expect(result.status).toBe("active");
    });

    it("should throw ValidationError when process name already exists", async () => {
      processRepository.create.mockRejectedValue(
        new ValidationError("Bu isimde bir süreç zaten var"),
      );

      await expect(
        processService.createProcess(mockProcessData, mockUserId),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("updateProcess", () => {
    const mockProcessId = new Types.ObjectId().toString();
    const mockUpdateData = {
      name: "Güncellenmiş Süreç",
      description: "Güncellenmiş açıklama",
      status: "inactive" as const,
    };

    it("should update process successfully", async () => {
      const mockUpdatedProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        ...mockUpdateData,
        bpmnXml: mockProcessData.bpmnXml,
        version: 1,
        isTemplate: false,
        steps: [],
        createdBy: mockUserId,
        updatedBy: mockUserId,
      });

      processRepository.findById.mockResolvedValue(mockUpdatedProcess);
      processRepository.update.mockResolvedValue(mockUpdatedProcess);

      const result = await processService.updateProcess(
        mockProcessId,
        mockUpdateData,
        mockUserId,
      );

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(processRepository.update).toHaveBeenCalledWith(
        mockProcessId,
        mockUpdateData,
        mockUserId,
      );
      expect(result.name).toBe(mockUpdateData.name);
      expect(result.status).toBe(mockUpdateData.status);
    });

    it("should throw ValidationError when process not found", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(
        processService.updateProcess(mockProcessId, mockUpdateData, mockUserId),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when process name already exists", async () => {
      processRepository.findById.mockResolvedValue({} as IProcess);
      processRepository.update.mockRejectedValue(
        new ValidationError("Bu isimde bir süreç zaten var"),
      );

      await expect(
        processService.updateProcess(mockProcessId, mockUpdateData, mockUserId),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if process with same name exists", async () => {
      const existingProcess = createMockProcess({
        name: "Existing Process",
      });
      processRepository.findByName.mockResolvedValue(existingProcess);

      const updateData = {
        name: "Existing Process",
        description: "Updated Description",
      };

      await expect(
        processService.updateProcess(
          new Types.ObjectId().toString(),
          updateData,
          new Types.ObjectId(),
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("should allow update if name is unchanged", async () => {
      const processId = new Types.ObjectId();
      const existingProcess = createMockProcess({
        _id: processId,
        name: "Test Process",
      });

      // findById mock'unu ekleyelim
      processRepository.findById.mockResolvedValue(existingProcess);
      processRepository.findByName.mockResolvedValue(existingProcess);
      processRepository.update.mockResolvedValue(existingProcess);

      const updateData = {
        name: "Test Process",
        description: "Updated Description",
      };

      await expect(
        processService.updateProcess(
          processId.toString(),
          updateData,
          new Types.ObjectId(),
        ),
      ).resolves.not.toThrow();

      // İsteğe bağlı olarak çağrıların doğru parametrelerle yapıldığını kontrol edebiliriz
      expect(processRepository.findById).toHaveBeenCalledWith(
        processId.toString(),
      );
      expect(processRepository.update).toHaveBeenCalled();
    });
  });

  describe("deleteProcess", () => {
    const mockProcessId = new Types.ObjectId().toString();

    it("should delete process successfully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        name: "Test Process",
        status: "active" as ProcessStatus,
        // Add the necessary Mongoose Document methods here if needed
      });
      processRepository.findById.mockResolvedValue(mockProcess);
      processRepository.delete.mockResolvedValue(undefined);
      bpmnEngine.stopInstance.mockResolvedValue(undefined);

      const result = await processService.deleteProcess(mockProcessId);

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.stopInstance).toHaveBeenCalledWith(
        `PROC_${mockProcessId}`,
      );
      expect(processRepository.delete).toHaveBeenCalledWith(mockProcessId);
      expect(result).toEqual({ message: "Süreç başarıyla silindi" });
    });

    it("should throw ValidationError when process not found", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(processService.deleteProcess(mockProcessId)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError when process ID is invalid", async () => {
      processRepository.findById.mockRejectedValue({
        name: "CastError",
        message: "Geçersiz süreç ID formatı",
      });

      await expect(processService.deleteProcess("invalid-id")).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getProcessById", () => {
    const mockProcessId = new Types.ObjectId().toString();

    it("should get process by id successfully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        name: "Test Süreci",
        description: "Test süreç açıklaması",
        status: "active" as const,
        isTemplate: false,
        steps: [],
        version: 1,
        bpmnXml: mockProcessData.bpmnXml,
        createdBy: mockUserId,
        updatedBy: mockUserId,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.getInstanceStatus.mockReturnValue("active");

      const result = await processService.getProcessById(mockProcessId);

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.getInstanceStatus).toHaveBeenCalledWith(
        `PROC_${mockProcessId}`,
      );
      expect(result.id).toBe(mockProcessId);
      expect(result.status).toBe("active");
      expect(result.engineStatus).toBe("active");
    });

    it("should handle engine status error gracefully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        name: "Test Süreci",
        description: "Test süreç açıklaması",
        status: "active" as const,
        isTemplate: false,
        steps: [],
        version: 1,
        bpmnXml: mockProcessData.bpmnXml,
        createdBy: mockUserId,
        updatedBy: mockUserId,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.getInstanceStatus.mockImplementation(() => {
        throw new Error("Engine error");
      });

      const result = await processService.getProcessById(mockProcessId);
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
          _id: new Types.ObjectId(),
          name: "Test Süreci 1",
          description: "Test süreç açıklaması 1",
          status: "active" as const,
          isTemplate: false,
          steps: [],
          version: 1,
          bpmnXml:
            "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>",
          createdBy: mockUserId,
          updatedBy: mockUserId,
        }),
        createMockProcess({
          _id: new Types.ObjectId(),
          name: "Test Süreci 2",
          description: "Test süreç açıklaması 2",
          status: "active" as const,
          isTemplate: false,
          steps: [],
          version: 1,
          bpmnXml:
            "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>",
          createdBy: mockUserId,
          updatedBy: mockUserId,
        }),
      ];

      processRepository.findAll.mockResolvedValue({
        processes: mockProcesses,
        total: 2,
      });

      const result = await processService.getProcesses(mockFilters);

      expect(processRepository.findAll).toHaveBeenCalledWith(mockFilters);
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

      expect(result.processes).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("should return filtered processes", async () => {
      const filters: ProcessFilterDTO = {
        status: "active",
        search: "test",
      };
      const processes = [
        createMockProcess({ _id: new Types.ObjectId(), name: "Test Süreci 1" }),
        createMockProcess({ _id: new Types.ObjectId(), name: "Test Süreci 2" }),
      ];
      processRepository.findAll.mockResolvedValue({
        processes,
        total: processes.length,
      });

      const result = await processService.getProcesses(filters);

      // processes array uzunluğunu kontrol et
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
        name: "Test Süreci",
        description: "Test süreç açıklaması",
        status: "active" as ProcessStatus,
        isTemplate: false,
        steps: [],
        version: 1,
        bpmnXml: mockProcessData.bpmnXml,
        createdBy: mockUserId,
        updatedBy: mockUserId,
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.updateInstanceStatus.mockResolvedValue(undefined);
      processRepository.update.mockResolvedValue(mockProcess);

      await processService.updateProcessStatus(
        mockProcessId,
        "active" as ProcessStatus,
      );

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.updateInstanceStatus).toHaveBeenCalledWith(
        `PROC_${mockProcessId}`,
        "active",
      );
      expect(processRepository.update).toHaveBeenCalledWith(
        mockProcessId,
        { status: "active" },
        mockProcess.createdBy,
      );
    });

    it("should throw ValidationError when process not found", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(
        processService.updateProcessStatus(mockProcessId, "active"),
      ).rejects.toThrow(ValidationError);
    });

    it("should handle engine errors gracefully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(),
        status: "active",
      });
      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.updateInstanceStatus.mockRejectedValue(
        new Error(ERROR_MESSAGES.ENGINE_ERROR),
      );

      await expect(
        processService.updateProcessStatus(
          mockProcessId,
          "inactive" as ProcessStatus,
        ),
      ).rejects.toThrow(ERROR_MESSAGES.ENGINE_ERROR);
    });

    it("should throw ValidationError for invalid status transition", async () => {
      const processId = new Types.ObjectId();
      const currentStatus = "active" as ProcessStatus;
      const invalidNextStatus = "inactive" as ProcessStatus;
      
      const process = createMockProcess({
        _id: processId,
        status: currentStatus,
      });

      processRepository.findById.mockResolvedValue(process);
      processRepository.update.mockRejectedValue(
        new ValidationError(ERROR_MESSAGES.PROCESS_UPDATE_FAILED)
      );

      await expect(
        processService.updateProcessStatus(
          processId.toString(),
          invalidNextStatus,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("should allow valid status transition", async () => {
      const processId = new Types.ObjectId();
      const process = createMockProcess({
        _id: processId,
        status: "active" as ProcessStatus,
      });
      processRepository.findById.mockResolvedValue(process);
      processRepository.updateStatus.mockResolvedValue(process);

      await expect(
        processService.updateProcessStatus(
          processId.toString(),
          "inactive" as ProcessStatus,
        ),
      ).resolves.not.toThrow();
    });

    it("should call updateStatus with correct arguments", async () => {
      const processId = new Types.ObjectId();
      const process = createMockProcess({
        _id: processId,
        status: "pending" as ProcessStatus,
      });

      // Mock repository responses
      processRepository.findById.mockResolvedValue(process);
      processRepository.update.mockResolvedValue(process);

      await processService.updateProcessStatus(
        processId.toString(),
        "active" as ProcessStatus,
      );

      expect(processRepository.findById).toHaveBeenCalledWith(
        processId.toString(),
      );
      expect(processRepository.update).toHaveBeenCalledWith(
        processId.toString(),
        { status: "active" },
        process.createdBy,
      );
    });
  });
});
