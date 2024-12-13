import { Types } from "mongoose";
import { describe, it, expect } from "vitest";

import {
  convertBpmnToProcessSteps,
  mapBpmnTypeToProcessType,
  convertProcessToDTO,
} from "../../features/processes/utils/process.utils";

import type { BPMNElement } from "../../core/bpmn/parsers/bpmn-parser";
import type { IProcess } from "../../features/processes/models/process.model";
import { createExpectedProcessDTO, createMockProcess, createBpmnElement, createExpectedProcessStep } from "../helpers/process.fixtures";

describe("Process Utils", () => {
  describe("convertBpmnToProcessSteps", () => {
    it("should convert BPMN elements to process steps", () => {
      const elements = [
        createBpmnElement({ id: "task1", name: "Task 1", type: "userTask" }),
        createBpmnElement({ id: "notification1", name: "Notification 1", type: "serviceTask" }),
        createBpmnElement({ id: "approval1", name: "Approval 1", type: "approvalTask" })
      ];

      const result = convertBpmnToProcessSteps(elements);

      expect(result).toEqual([
        createExpectedProcessStep({
          elementId: "task1",
          name: "Task 1",
          type: "task",
          sequence: 1
        }),
        createExpectedProcessStep({
          elementId: "notification1",
          name: "Notification 1",
          type: "notification",
          sequence: 2
        }),
        createExpectedProcessStep({
          elementId: "approval1",
          name: "Approval 1",
          type: "approval",
          sequence: 3
        })
      ]);
    });

    it("should handle empty elements array", () => {
      const result = convertBpmnToProcessSteps([]);
      expect(result).toEqual([]);
    });

    it("should filter out unsupported element types", () => {
      const elements: BPMNElement[] = [
        {
          id: "start1",
          name: "Start Event",
          type: "startEvent",
          outgoing: [],
        },
        {
          id: "task1",
          name: "Task 1",
          type: "userTask",
          outgoing: [],
        }
      ];

      const result = convertBpmnToProcessSteps(elements);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Task 1");
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

    it("should convert all supported BPMN element types", () => {
      const elements = [
        createBpmnElement({ id: "task1", name: "User Task", type: "userTask" }),
        createBpmnElement({ id: "script1", name: "Script Task", type: "scriptTask" }),
        createBpmnElement({ id: "rule1", name: "Business Rule", type: "businessRuleTask" })
      ];

      const result = convertBpmnToProcessSteps(elements);

      expect(result).toEqual([
        createExpectedProcessStep({
          elementId: "task1",
          name: "User Task",
          type: "task",
          sequence: 1
        }),
        createExpectedProcessStep({
          elementId: "script1",
          name: "Script Task",
          type: "automation",
          sequence: 2
        }),
        createExpectedProcessStep({
          elementId: "rule1",
          name: "Business Rule",
          type: "decision",
          sequence: 3
        })
      ]);
    });
  });

  describe("mapBpmnTypeToProcessType", () => {
    it("should map userTask to task", () => {
      expect(mapBpmnTypeToProcessType("userTask")).toBe("task");
    });

    it("should map serviceTask to notification", () => {
      expect(mapBpmnTypeToProcessType("serviceTask")).toBe("notification");
    });

    it("should map approvalTask to approval", () => {
      expect(mapBpmnTypeToProcessType("approvalTask")).toBe("approval");
    });

    it("should map scriptTask to automation", () => {
      expect(mapBpmnTypeToProcessType("scriptTask")).toBe("automation");
    });

    it("should map businessRuleTask to decision", () => {
      expect(mapBpmnTypeToProcessType("businessRuleTask")).toBe("decision");
    });

    it("should handle empty or undefined type", () => {
      expect(mapBpmnTypeToProcessType("")).toBe("task");
      expect(mapBpmnTypeToProcessType(undefined)).toBe("task");
    });

    it("should default to task for unknown types", () => {
      expect(mapBpmnTypeToProcessType("unknownType")).toBe("task");
      expect(mapBpmnTypeToProcessType("customTask")).toBe("task");
      expect(mapBpmnTypeToProcessType("invalidType")).toBe("task");
    });
  });

  describe("convertProcessToDTO", () => {
    it("should convert IProcess to ProcessResponseDTO", () => {
      const mockProcess = {
        _id: new Types.ObjectId(),
        name: "Test Process",
        description: "Test Description",
        bpmnXml: "<xml>test</xml>",
        status: "active",
        category: "test-category",
        priority: "medium",
        owner: new Types.ObjectId(),
        participants: [new Types.ObjectId(), new Types.ObjectId()],
        metadata: {
          estimatedDuration: 60,
          costCenter: "IT",
          tags: ["test", "process"]
        },
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
      expect(result).toEqual(createExpectedProcessDTO(mockProcess));
    });

    it("should handle undefined updatedBy", () => {
      const mockProcess = createMockProcess({
        updatedBy: undefined
      });

      const result = convertProcessToDTO(mockProcess);
      expect(result).toEqual(createExpectedProcessDTO(mockProcess));
    });

    it("should handle undefined optional fields", () => {
      const mockProcess = createMockProcess({
        description: undefined,
        participants: undefined,
        metadata: {
          estimatedDuration: 60,
          tags: []
        }
      });

      const result = convertProcessToDTO(mockProcess);
      expect(result).toEqual(createExpectedProcessDTO(mockProcess));
    });
  });
});
