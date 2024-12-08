import { type Document, Types } from 'mongoose';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { type BPMNEngine } from "@/core/bpmn/engine/bpmn-engine";
import { type ProcessFilterDTO } from "@/features/processes/dtos/process-filter.dto";
import { type IProcess } from "@/features/processes/models/process.model";
import { ProcessStatus } from "@/features/processes/types/process.types";
import { ProcessService } from "@/features/processes/services/process.service";
import { type BPMNProcessDefinition } from "@/features/processes/types/process.types";
import { ERROR_MESSAGES } from "@/core/constants/error-messages";
import { createMockProcess } from '../helpers/process.fixtures';

// Test interface'ini güncelle
interface MockRepository {
  findById: ReturnType<typeof vi.fn>;
  findByName: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  findAll: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  updateStatus: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  exists: ReturnType<typeof vi.fn>;
}

interface MockBPMNEngine extends BPMNEngine {
  deploy: ReturnType<typeof vi.fn>;
  startInstance: ReturnType<typeof vi.fn>;
  stopInstance: ReturnType<typeof vi.fn>;
  updateInstanceStatus: ReturnType<typeof vi.fn>;
  getInstanceStatus: ReturnType<typeof vi.fn>;
  startProcess: ReturnType<typeof vi.fn>;
  executeTask: ReturnType<typeof vi.fn>;
  instances: Map<string, BPMNProcessDefinition>;
}

vi.mock("@/infrastructure/database/mongodb/repositories/ProcessRepository");
vi.mock("@/core/bpmn/engine/bpmn-engine");
vi.mock("../../monitoring/logging/providers/winston.logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("ProcessService", () => {
  let processService: ProcessService;
  let processRepository: MockRepository;
  let bpmnEngine: MockBPMNEngine;

  beforeEach(() => {
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
    };

    bpmnEngine = {
      deploy: vi.fn(),
      startInstance: vi.fn(),
      stopInstance: vi.fn(),
      updateInstanceStatus: vi.fn(),
      getInstanceStatus: vi.fn(),
      startProcess: vi.fn(),
      executeTask: vi.fn(),
      instances: new Map(),
    } as MockBPMNEngine;

    processService = new ProcessService(processRepository, bpmnEngine as BPMNEngine);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("deleteProcess", () => {
    const mockProcessId = new Types.ObjectId().toString();

    it("should delete process successfully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.DRAFT
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      processRepository.delete.mockResolvedValue(undefined);
      bpmnEngine.stopInstance.mockResolvedValue(undefined);

      await processService.deleteProcess(mockProcessId);

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(processRepository.delete).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.stopInstance).toHaveBeenCalledWith(`PROC_${mockProcessId}`);
    });
  });

  describe("createProcess", () => {
    it("should create a new process successfully", async () => {
      const mockCreatedProcess = createMockProcess({
        name: "Test Süreci",
        description: "Test süreç açıklaması",
        status: ProcessStatus.PENDING,
        bpmnXml: "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>"
      });

      const mockProcessDTO = {
        name: "Test Süreci",
        description: "Test süreç açıklaması",
        bpmnXml: "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>",
      };

      processRepository.create.mockResolvedValue(mockCreatedProcess);
      processRepository.findById.mockResolvedValue(mockCreatedProcess);
      bpmnEngine.startProcess.mockResolvedValue({
        id: "test-instance-id",
        processId: mockCreatedProcess._id.toString(),
        status: ProcessStatus.ACTIVE
      });

      const result = await processService.createProcess(mockProcessDTO, new Types.ObjectId());

      expect(processRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockProcessDTO), expect.any(Types.ObjectId));
      expect(bpmnEngine.startProcess).toHaveBeenCalled();
      expect(result).toMatchObject({
        ...mockProcessDTO,
        instanceId: "test-instance-id"
      });
    });

    it("should throw ValidationError when process name already exists", async () => {
      processRepository.create.mockRejectedValue(
        new Error("Bu isimde bir süreç zaten var"),
      );

      await expect(
        processService.createProcess(
          {
            name: "Test Süreci",
            description: "Test süreç açıklaması",
            bpmnXml: "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>",
          },
          new Types.ObjectId(),
        ),
      ).rejects.toThrow(Error);
    });
  });

  describe("updateProcess", () => {
    const mockProcessId = new Types.ObjectId().toString();
    const mockUpdateData = {
      name: "Güncellenmiş Süreç",
      description: "Güncellenmiş açıklama",
      status: "inactive" as ProcessStatus,
    };

    it("should update process successfully", async () => {
      const updatedBy = new Types.ObjectId();
      const mockUpdatedProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        name: "Güncellenmiş Süreç",
        description: "Güncellenmiş açıklama",
        status: ProcessStatus.INACTIVE,
        updatedBy
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
      expect(result.name).toBe(mockUpdateData.name);
      expect(result.status).toBe(mockUpdateData.status);
    });

    it("should throw ValidationError when process not found", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(
        processService.updateProcess(mockProcessId, mockUpdateData, new Types.ObjectId()),
      ).rejects.toThrow(Error);
    });

    it("should throw ValidationError when process name already exists", async () => {
      processRepository.findById.mockResolvedValue({} as IProcess);
      processRepository.update.mockRejectedValue(
        new Error("Bu isimde bir süreç zaten var"),
      );

      await expect(
        processService.updateProcess(mockProcessId, mockUpdateData, new Types.ObjectId()),
      ).rejects.toThrow(Error);
    });

    it("should throw ValidationError if process with same name exists", async () => {
      const existingProcess = {
        _id: new Types.ObjectId(),
        name: "Existing Process",
      } as IProcess;
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
      ).rejects.toThrow(Error);
    });

    it("should allow update if name is unchanged", async () => {
      const processId = new Types.ObjectId();
      const existingProcess = createMockProcess({
        _id: processId,
        name: "Test Process",
        description: "Test Description",
        status: ProcessStatus.ACTIVE
      });

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
    });
  });

  describe("getProcessById", () => {
    const mockProcessId = new Types.ObjectId().toString();

    it("should get process by id successfully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        name: "Test Süreci",
        description: "Test süreç açıklaması",
        status: ProcessStatus.ACTIVE
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.getInstanceStatus.mockReturnValue(ProcessStatus.ACTIVE);

      const result = await processService.getProcessById(mockProcessId);

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.getInstanceStatus).toHaveBeenCalledWith(`PROC_${mockProcessId}`);
      expect(result).toMatchObject({
        id: mockProcessId,
        status: ProcessStatus.ACTIVE,
        engineStatus: ProcessStatus.ACTIVE
      });
    });

    it("should handle engine status error gracefully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(mockProcessId),
        status: ProcessStatus.ACTIVE
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      bpmnEngine.getInstanceStatus.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.ENGINE_ERROR);
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
          name: "Test Süreci 1",
          description: "Test süreç açıklaması 1",
          status: ProcessStatus.ACTIVE
        }),
        createMockProcess({
          name: "Test Süreci 2",
          description: "Test süreç açıklaması 2",
          status: ProcessStatus.ACTIVE
        })
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
        createMockProcess({
          name: "Test Süreci 1",
          description: "Test süreç açıklaması 1",
          status: ProcessStatus.ACTIVE
        }),
        createMockProcess({
          name: "Test Süreci 2",
          description: "Test süreç açıklaması 2",
          status: ProcessStatus.ACTIVE
        })
      ];
      processRepository.findAll.mockResolvedValue({
        processes,
        total: processes.length,
      });

      const result = await processService.getProcesses(filters);

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
        status: ProcessStatus.ACTIVE
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      processRepository.update.mockResolvedValue(mockProcess);
      bpmnEngine.updateInstanceStatus.mockResolvedValue(undefined);

      await processService.updateProcessStatus(mockProcessId, "inactive");

      expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
      expect(bpmnEngine.updateInstanceStatus).toHaveBeenCalledWith(
        `PROC_${mockProcessId}`,
        "inactive"
      );
      expect(processRepository.update).toHaveBeenCalledWith(
        mockProcessId,
        { status: "inactive" as ProcessStatus },
        mockProcess.createdBy
      );
    });

    it("should throw ValidationError when process not found", async () => {
      processRepository.findById.mockResolvedValue(null);

      await expect(
        processService.updateProcessStatus(mockProcessId, "active"),
      ).rejects.toThrow(Error);
    });

    it("should handle engine errors gracefully", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(),
        status: ProcessStatus.DRAFT
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
      ).rejects.toThrow(Error);
    });

    it("should throw ValidationError for invalid status transition", async () => {
      const mockProcess = createMockProcess({
        _id: new Types.ObjectId(),
        status: ProcessStatus.ACTIVE
      });

      processRepository.findById.mockResolvedValue(mockProcess);
      processRepository.update.mockRejectedValue(
        new Error(ERROR_MESSAGES.PROCESS_UPDATE_FAILED)
      );

      await expect(
        processService.updateProcessStatus(
          mockProcess._id.toString(),
          "invalid_status" as ProcessStatus,
        ),
      ).rejects.toThrow(Error);
    });
  });

  describe("getProcessStatus", () => {
    it("should return process status successfully", async () => {
      const mockProcessId = "test-process-id";
      bpmnEngine.getInstanceStatus.mockResolvedValue({ status: ProcessStatus.ACTIVE });
      
      const result = await processService.getProcessStatus(mockProcessId);
      
      expect(result).toBe(ProcessStatus.ACTIVE);
      expect(bpmnEngine.getInstanceStatus).toHaveBeenCalledWith(mockProcessId);
    });
  });
});
