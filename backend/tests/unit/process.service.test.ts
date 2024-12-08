// İmport yollarını güncelle
import { ProcessService } from "../../features/processes/services/process.service";
import { ProcessRepository } from "../../infrastructure/database/mongodb/repositories/ProcessRepository";
import { BPMNEngine } from "../../core/bpmn/engine/bpmn-engine";
import { Types } from "mongoose";
import { ValidationError } from "../../shared/errors/types/app-error";
import { IProcess } from "../../features/processes/models/process.model";
import { ProcessStatus } from "../../features/processes/types/process.types";
import { ERROR_MESSAGES } from "../../monitoring/logging/providers/winston.logger";
import { ProcessFilterDTO } from "../../features/processes/dtos/process-filter.dto";
import { createMockProcess } from "../helpers/process.fixtures";

// Test interface'ini güncelle
type MockRepository = jest.Mocked<ProcessRepository> & {
  findByName: jest.Mock;
  find: jest.Mock;
  findAll: jest.Mock; // findAll ekle
  updateStatus: jest.Mock;
};

jest.mock("@/infrastructure/database/mongodb/repositories/ProcessRepository");
jest.mock("@/core/bpmn/engine/bpmn-engine");

describe("ProcessService", () => {
  let processService: ProcessService;
  let processRepository: MockRepository;
  let bpmnEngine: jest.Mocked<BPMNEngine>;

  const mockProcessData = {
    name: "Test Süreci",
    description: "Test süreç açıklaması",
    bpmnXml:
      "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>",
  };

  const mockUserId = new Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();

    processRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      find: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    } as unknown as MockRepository;

    bpmnEngine = {
      startProcess: jest.fn(),
      stopInstance: jest.fn(),
      getInstanceStatus: jest.fn(),
      updateInstanceStatus: jest.fn(),
    } as unknown as jest.Mocked<BPMNEngine>;

    processService = new ProcessService(processRepository, bpmnEngine);
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
        mockUserId
      );

      expect(processRepository.create).toHaveBeenCalledWith(
        mockProcessData,
        mockUserId
      );
      expect(bpmnEngine.startProcess).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(mockProcessData.name);
      expect(result.status).toBe("active");
    });

    it("should throw ValidationError when process name already exists", async () => {
      processRepository.create.mockRejectedValue(
        new ValidationError("Bu isimde bir süreç zaten var")
      );

      await expect(
        processService.createProcess(mockProcessData, mockUserId)
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
        mockUserId
      );

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(processRepository.update).toHaveBeenCalledWith(
        mockProcessId,
        mockUpdateData,
        mockUserId
      );
      expect(result.name).toBe(mockUpdateData.name);
      expect(result.status).toBe(mockUpdateData.status);
    });

    it("should throw ValidationError when process not found", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(
        processService.updateProcess(mockProcessId, mockUpdateData, mockUserId)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when process name already exists", async () => {
      processRepository.findById.mockResolvedValue({} as IProcess);
      processRepository.update.mockRejectedValue(
        new ValidationError("Bu isimde bir süreç zaten var")
      );

      await expect(
        processService.updateProcess(mockProcessId, mockUpdateData, mockUserId)
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
          new Types.ObjectId()
        )
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
          new Types.ObjectId()
        )
      ).resolves.not.toThrow();

      // İsteğe bağlı olarak çağrıların doğru parametrelerle yapıldığını kontrol edebiliriz
      expect(processRepository.findById).toHaveBeenCalledWith(
        processId.toString()
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
        `PROC_${mockProcessId}`
      );
      expect(processRepository.delete).toHaveBeenCalledWith(mockProcessId);
      expect(result).toEqual({ message: "Süreç başarıyla silindi" });
    });

    it("should throw ValidationError when process not found", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(processService.deleteProcess(mockProcessId)).rejects.toThrow(
        ValidationError
      );
    });

    it("should throw ValidationError when process ID is invalid", async () => {
      processRepository.findById.mockRejectedValue({
        name: "CastError",
        message: "Geçersiz süreç ID formatı",
      });

      await expect(processService.deleteProcess("invalid-id")).rejects.toThrow(
        ValidationError
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
        `PROC_${mockProcessId}`
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
        "active" as ProcessStatus
      );

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.updateInstanceStatus).toHaveBeenCalledWith(
        `PROC_${mockProcessId}`,
        "active"
      );
      expect(processRepository.update).toHaveBeenCalledWith(
        mockProcessId,
        { status: "active" },
        mockProcess.createdBy
      );
    });

    it("should throw ValidationError when process not found", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(
        processService.updateProcessStatus(mockProcessId, "active")
      ).rejects.toThrow(ValidationError);
    });

    it("should handle engine errors gracefully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(),
        name: "Test Process",
        description: "Test Description",
        status: "active",
        steps: [
          {
            name: "Step 1",
            type: "task",
            status: "pending",
          },
        ],
        isTemplate: false,
        version: 1,
        createdBy: new Types.ObjectId(),
        updatedBy: new Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.updateInstanceStatus.mockRejectedValue(
        new Error(ERROR_MESSAGES.ENGINE_ERROR)
      );

      await expect(
        processService.updateProcessStatus(
          mockProcessId,
          "completed" as ProcessStatus
        )
      ).rejects.toThrow(ERROR_MESSAGES.PROCESS_UPDATE_FAILED);
    });

    it("should throw ValidationError for invalid status transition", async () => {
      const processId = new Types.ObjectId();
      const process = createMockProcess({
        _id: processId,
        status: "completed" as ProcessStatus,
      });

      // Mock repository responses
      processRepository.findById.mockResolvedValue(process);
      processRepository.update.mockRejectedValue(
        new ValidationError("Geçersiz durum geçişi")
      );

      await expect(
        processService.updateProcessStatus(
          processId.toString(),
          "active" as ProcessStatus
        )
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
          "completed" as ProcessStatus // userId parametresini kaldırdık
        )
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
        "active" as ProcessStatus
      );

      expect(processRepository.findById).toHaveBeenCalledWith(
        processId.toString()
      );
      expect(processRepository.update).toHaveBeenCalledWith(
        processId.toString(),
        { status: "active" },
        process.createdBy
      );
    });
  });
});
