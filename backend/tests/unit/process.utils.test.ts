import { Types } from "mongoose";
import { describe, it, expect } from "vitest";

import {
  convertBpmnToProcessSteps,
  mapBpmnTypeToProcessType,
  convertProcessToDTO,
} from "../../features/processes/utils/process.utils";

import type { BPMNElement } from "../../core/bpmn/parsers/bpmn-parser";
import type { IProcess } from "../../features/processes/models/process.model";
import {
  createExpectedProcessDTO,
  createMockProcess,
  createBpmnElement,
  createExpectedProcessStep,
  type ProcessStepOverrides
} from "../helpers/process.fixtures";

describe("Process Utils", () => {
  describe("convertBpmnToProcessSteps", () => {
    const createTestElements = (...elements: Array<Partial<BPMNElement>>) =>
      elements.map(el => createBpmnElement(el));

    const assertProcessSteps = (elements: BPMNElement[], expectedSteps: Array<ProcessStepOverrides>) => {
      const result = convertBpmnToProcessSteps(elements);
      expect(result).toEqual(expectedSteps.map((step, index) =>
        createExpectedProcessStep({
          ...step,
          sequence: index + 1
        })
      ));
    };

    it("should convert BPMN elements to process steps", () => {
      const elements = createTestElements(
        { id: "task1", name: "Task 1", type: "userTask" },
        { id: "notification1", name: "Notification 1", type: "serviceTask" },
        { id: "approval1", name: "Approval 1", type: "approvalTask" }
      );

      assertProcessSteps(elements, [
        { elementId: "task1", name: "Task 1", type: "task" },
        { elementId: "notification1", name: "Notification 1", type: "notification" },
        { elementId: "approval1", name: "Approval 1", type: "approval" }
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

    it("should handle dependencies between steps correctly", () => {
      const elements = createTestElements(
        {
          id: "task1",
          name: "Task 1",
          type: "userTask",
          outgoing: ["task2"]
        },
        {
          id: "task2",
          name: "Task 2",
          type: "serviceTask",
          outgoing: ["task3"]
        },
        {
          id: "task3",
          name: "Task 3",
          type: "approvalTask",
          outgoing: []
        }
      );

      assertProcessSteps(elements, [
        {
          elementId: "task1",
          name: "Task 1",
          type: "task",
          dependsOn: ["task2"]
        },
        {
          elementId: "task2",
          name: "Task 2",
          type: "notification",
          dependsOn: ["task3"]
        },
        {
          elementId: "task3",
          name: "Task 3",
          type: "approval",
          dependsOn: []
        }
      ]);
    });

    it("should filter out dependencies to unsupported elements", () => {
      const elements = createTestElements(
        {
          id: "task1",
          name: "Task 1",
          type: "userTask",
          outgoing: ["start1", "task2"]
        },
        {
          id: "task2",
          name: "Task 2",
          type: "serviceTask",
          outgoing: []
        },
        {
          id: "start1",
          name: "Start Event",
          type: "startEvent",
          outgoing: []
        }
      );

      assertProcessSteps(elements, [
        {
          elementId: "task1",
          name: "Task 1",
          type: "task",
          dependsOn: ["task2"]  // start1 filtrelenmiş olmalı
        },
        {
          elementId: "task2",
          name: "Task 2",
          type: "notification",
          dependsOn: []
        }
      ]);
    });

    it("should handle malformed BPMN elements gracefully", () => {
      const malformedElements = [
        { id: "task1", type: "invalidType" } as BPMNElement,
        { id: "task2", type: "userTask", outgoing: "invalid" } as unknown as BPMNElement,
        { id: "task3", type: "userTask", outgoing: undefined } as BPMNElement
      ];

      const result = convertBpmnToProcessSteps(malformedElements);
      expect(result).toEqual([]);
    });
    it("should handle invalid dependency references", () => {
      const elements = createTestElements(
        {
          id: "task1",
          type: "userTask",
          outgoing: ["nonexistent1", "nonexistent2"]
        }
      );

      const result = convertBpmnToProcessSteps(elements);
      expect(result[0].dependsOn).toEqual([]);
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

    it("should handle null type safely", () => {
      expect(mapBpmnTypeToProcessType(null as any)).toBe("task");
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
