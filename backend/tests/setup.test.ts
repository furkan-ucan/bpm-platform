/// <reference types="node" />
import { describe, it, expect, vi } from 'vitest';

import { toBeValidId } from "./customMatchers";

// Custom matcher'ı Vitest'e ekle
expect.extend({ toBeValidId });

describe("Test Setup Configuration", () => {
  describe("Global Matchers", () => {
    it("should have custom matcher toBeValidId", () => {
      expect(expect.extend).toBeDefined();
      expect(toBeValidId).toBeDefined();
    });
  });

  describe("Environment Setup", () => {
    it("should run in test environment", () => {
      expect(process.env.NODE_ENV).toBe("test");
    });

    it("should clear mocks after each test", () => {
      const mockFn = vi.fn();
      mockFn();
      expect(mockFn).toHaveBeenCalled();
      vi.clearAllMocks();
      expect(mockFn).not.toHaveBeenCalled();
    });
  });
});
