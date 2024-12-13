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
import { ValidationError } from "@/shared/errors/common/validation.error";
import { ProcessInstanceStatus } from "@/core/bpmn/types/process.types";
import { logger } from "@/shared/utils/logger";
import { TechnicalError } from "@/shared/errors/common/technical.error";
import { type IProcessRepository } from "@/shared/interfaces/repositories/IProcessRepository";
import { convertProcessToDTO } from "@/features/processes/utils/process.utils";
import { ProcessMapper } from "@/features/processes/mappers/process.mapper";

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

  describe("Process Management", () => {
    describe("Create Process", () => {
      const mockProcessDTO = {
        name: "Test Süreci",
        description: "Test süreç açıklaması",
        bpmnXml:
          "<?xml version='1.0' encoding='UTF-8'?><definitions></definitions>",
        category: "test-category",
      };

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
        expect(result).toEqual(convertProcessToDTO(mockProcess));
      });

      describe("Error Handling", () => {
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
      });
    });

    describe("Update Process", () => {
      const mockUpdateData = {
        name: "Güncellenmiş Süreç",
        description: "Güncellenmiş açıklama",
        status: ProcessStatus.INACTIVE,
        updatedAt: new Date(),
      };

      // tests/unit/process.service.test.ts
      it("should update process successfully", async () => {
        const updatedBy = new Types.ObjectId();
        const mockUpdateData = {
          name: "Güncellenmiş Süreç",
          description: "Güncellenmiş açıklama",
          status: ProcessStatus.INACTIVE,
          updatedAt: expect.any(Date),
        };

        const mockProcess = createMockProcess({
          _id: new Types.ObjectId(mockProcessId),
          ...mockUpdateData,
        });

        processRepository.findById.mockResolvedValue(mockProcess);
        processRepository.update.mockResolvedValue(mockProcess);

        const result = await processService.updateProcess(
          mockProcessId,
          mockUpdateData,
          updatedBy,
        );

        // ID dönüşümünü kontrol et
        expect(result._id.toString()).toBe(mockProcess._id.toString());

        // Diğer alanları kontrol et
        expect(result).toMatchObject({
          name: mockUpdateData.name,
          description: mockUpdateData.description,
          status: mockUpdateData.status,
        });
      });
      describe("Validation", () => {
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
            updatedAt: new Date(),
          };

          await expect(
            processService.updateProcess(
              mockProcessId,
              updateData,
              existingProcess.createdBy,
            ),
          ).rejects.toThrow(ValidationError);

          expect(processRepository.findById).toHaveBeenCalledWith(
            mockProcessId,
          );
          expect(processRepository.findByName).toHaveBeenCalledWith(
            updateData.name,
          );
        });
      });
    });

    describe("Status Management", () => {
      it("should update process status successfully", async () => {
        const mockProcess = createMockProcess({
          _id: new Types.ObjectId(mockProcessId),
          status: ProcessStatus.ACTIVE,
        });

        processRepository.findById.mockResolvedValue(mockProcess);
        processRepository.update.mockResolvedValue(mockProcess);
        bpmnEngine.updateInstanceStatus.mockResolvedValue(undefined);

        const result = await processService.updateProcessStatus(
          mockProcessId,
          ProcessStatus.INACTIVE,
        );

        expect(bpmnEngine.updateInstanceStatus).toHaveBeenCalledWith(
          `PROC_${mockProcessId}`,
          ProcessInstanceStatus.INACTIVE,
        );
        expect(result).toEqual(convertProcessToDTO(mockProcess));
      });

      describe("Error Cases", () => {
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
            processService.updateProcessStatus(
              mockProcessId,
              ProcessStatus.INACTIVE,
            ),
          ).rejects.toThrow(ERROR_MESSAGES.ENGINE.UPDATE_FAILED);
        });

        it("should throw ValidationError for invalid status", async () => {
          const mockProcess = createMockProcess({
            _id: new Types.ObjectId(mockProcessId),
          });

          processRepository.findById.mockResolvedValue(mockProcess);
          bpmnEngine.updateInstanceStatus.mockRejectedValue(
            new ValidationError(ERROR_MESSAGES.PROCESS.INVALID_STATUS),
          );

          await expect(
            processService.updateProcessStatus(
              mockProcessId,
              "INVALID_STATUS" as ProcessStatus,
            ),
          ).rejects.toThrow(ERROR_MESSAGES.PROCESS.INVALID_STATUS);
        });
      });
    });

    describe("Delete Process", () => {
      it("should delete process successfully", async () => {
        const mockProcess = createMockProcess({
          _id: new Types.ObjectId(mockProcessId),
          status: ProcessStatus.ACTIVE,
        });

        processRepository.findById.mockResolvedValue(mockProcess);
        processRepository.delete.mockResolvedValue(mockProcess);
        bpmnEngine.stopInstance.mockResolvedValue(undefined);

        await processService.deleteProcess(mockProcessId);

        expect(processRepository.findById).toHaveBeenCalledWith(mockProcessId);
        expect(processRepository.delete).toHaveBeenCalledWith(mockProcessId);
        expect(bpmnEngine.stopInstance).toHaveBeenCalledWith(
          `PROC_${mockProcessId}`,
        );
      });

      describe("Error Handling", () => {
        it("should throw ValidationError when process not found", async () => {
          processRepository.findById.mockResolvedValue(null);

          await expect(
            processService.deleteProcess(mockProcessId),
          ).rejects.toThrow(ERROR_MESSAGES.PROCESS.NOT_FOUND);
        });

        it("should handle engine errors gracefully", async () => {
          const mockProcess = createMockProcess({
            _id: new Types.ObjectId(mockProcessId),
          });

          processRepository.findById.mockResolvedValue(mockProcess);
          processRepository.delete.mockRejectedValue(
            new Error(ERROR_MESSAGES.ENGINE.ERROR),
          );
          bpmnEngine.stopInstance.mockRejectedValue(
            new Error(ERROR_MESSAGES.ENGINE.ERROR),
          );

          await expect(
            processService.deleteProcess(mockProcessId),
          ).rejects.toThrow(ERROR_MESSAGES.ENGINE.ERROR);

          expect(logger.error).toHaveBeenCalledWith(
            "Process delete error:",
            expect.objectContaining({
              domain: "Process",
              action: "delete",
              resourceId: mockProcessId,
              error: expect.any(Error),
              timestamp: expect.any(Date),
            }),
          );
        });

        it("should return success message after deletion", async () => {
          const mockProcess = createMockProcess({
            _id: new Types.ObjectId(mockProcessId),
          });

          processRepository.findById.mockResolvedValue(mockProcess);
          processRepository.delete.mockResolvedValue(mockProcess);
          bpmnEngine.stopInstance.mockResolvedValue(undefined);

          const result = await processService.deleteProcess(mockProcessId);

          expect(result).toEqual({
            message: ERROR_MESSAGES.PROCESS.DELETE_SUCCESS,
          });
        });
      });
    });
  });

  describe("Instance Management", () => {
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

    describe("Error Handling", () => {
      it("should handle instance creation error with validation error", async () => {
        const mockProcess = createMockProcess();
        const validationError = new ValidationError("Test validation error");

        processRepository.findById.mockResolvedValue(mockProcess);
        bpmnEngine.startProcess.mockRejectedValue(validationError);

        await expect(
          processService.createProcessInstance(mockProcessId),
        ).rejects.toThrow(validationError.message);

        // Logger kontrolünü güncelle
        expect(logger.error).toHaveBeenCalledWith(
          "Process createInstance error:",
          expect.objectContaining({
            error: validationError,
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

    describe("Instance Management Error Cases", () => {
      it("should handle instance state save error", async () => {
        const mockProcess = createMockProcess({
          _id: new Types.ObjectId(mockProcessId),
        });

        const error = new Error(ERROR_MESSAGES.ENGINE.ERROR);

        processRepository.findById.mockResolvedValue(mockProcess);
        bpmnEngine.getInstanceStatus.mockRejectedValue(error);

        await expect(
          processService.saveInstanceState(mockProcessId),
        ).rejects.toThrow(ERROR_MESSAGES.ENGINE.ERROR);

        expect(logger.error).toHaveBeenCalledWith(
          "Process instance state save error:",
          expect.objectContaining({
            domain: "Process",
            action: "saveInstanceState",
            resourceId: mockProcessId,
            error,
            timestamp: expect.any(Date),
          }),
        );
      });
    });
  });

  describe("Query Operations", () => {
    describe("Get Process By Id", () => {
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
        expect(result).toEqual({
          ...convertProcessToDTO(mockProcess),
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
    });

    describe("Get Processes", () => {
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

        const result = await processService.getProcesses({});
        if (!result) throw new Error("Result should be defined");

        expect(result.processes).toHaveLength(2);
        expect(result.pagination).toEqual({
          total: 2,
          page: 0,
          limit: 10,
          pages: 1,
        });
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

      it("should handle pagination correctly", async () => {
        const mockProcesses = Array(15)
          .fill(null)
          .map((_, index) =>
            createMockProcess({
              name: `Test Süreci ${index + 1}`,
              status: ProcessStatus.ACTIVE,
            }),
          );

        const page = 1;
        const limit = 10;
        const total = mockProcesses.length;

        processRepository.findAll.mockResolvedValue({
          processes: mockProcesses.slice(page * limit, (page + 1) * limit),
          total,
        });

        const result = await processService.getProcesses({ page, limit });
        if (!result) throw new Error("Result should be defined");

        expect(result.pagination).toEqual({
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        });
      });
    });
  });
});
