import { Types } from "mongoose";

import {
  convertBpmnToProcessSteps,
  mapBpmnTypeToProcessType,
  convertProcessToDTO,
} from "../../features/processes/utils/process.utils";

import type { BPMNElement } from "../../core/bpmn/parsers/bpmn-parser";
import type { IProcess } from "../../features/processes/models/process.model";

describe("Process Utils", () => {
  describe("convertBpmnToProcessSteps", () => {
    it("should convert BPMN elements to process steps", () => {
      const elements: BPMNElement[] = [
        {
          id: "task1",
          name: "Task 1",
          type: "userTask",
          outgoing: [],
        },
        {
          id: "notification1",
          name: "Notification 1",
          type: "serviceTask",
          outgoing: [],
        },
      ];

      const result = convertBpmnToProcessSteps(elements);

      expect(result).toEqual([
        {
          name: "Task 1",
          type: "task",
          status: "pending",
        },
        {
          name: "Notification 1",
          type: "notification",
          status: "pending",
        },
      ]);
    });

    it("should use element ID as name if name is not provided", () => {
      const elements: BPMNElement[] = [
        {
          id: "task1",
          type: "userTask",
          outgoing: [],
          name: "", // Add empty name to satisfy type
        },
      ];

      const result = convertBpmnToProcessSteps(elements);

      expect(result[0].name).toBe("task1");
    });
  });

  describe("mapBpmnTypeToProcessType", () => {
    it("should map userTask to task", () => {
      expect(mapBpmnTypeToProcessType("userTask")).toBe("task");
    });

    it("should map serviceTask to notification", () => {
      expect(mapBpmnTypeToProcessType("serviceTask")).toBe("notification");
    });

    it("should default to task for unknown types", () => {
      expect(mapBpmnTypeToProcessType("unknownType")).toBe("task");
    });
  });

  describe("convertProcessToDTO", () => {
    it("should convert IProcess to ProcessResponseDTO", () => {
      const mockProcess = {
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
      } as unknown as IProcess;

      const result = convertProcessToDTO(mockProcess);

      expect(result).toEqual({
        id: mockProcess._id.toString(),
        name: mockProcess.name,
        description: mockProcess.description,
        status: mockProcess.status,
        steps: mockProcess.steps,
        isTemplate: mockProcess.isTemplate,
        version: mockProcess.version,
        createdBy: mockProcess.createdBy.toString(),
        updatedBy: mockProcess.updatedBy?.toString(),
        createdAt: mockProcess.createdAt,
        updatedAt: mockProcess.updatedAt,
      });
    });

    it("should handle undefined updatedBy", () => {
      const mockProcess = {
        _id: new Types.ObjectId(),
        name: "Test Process",
        description: "Test Description",
        status: "active",
        steps: [],
        isTemplate: false,
        version: 1,
        createdBy: new Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IProcess;

      const result = convertProcessToDTO(mockProcess);

      expect(result.updatedBy).toBeUndefined();
    });
  });
});
