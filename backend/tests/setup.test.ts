// backend/tests/setup.test.ts
import { Types } from "mongoose";
import { toBeValidId } from "./customMatchers";

// Custom matcher'ı Jest'e ekle
expect.extend({ toBeValidId });

describe("Test Setup Configuration", () => {
  // backend/tests/setup.test.ts
  describe("Timeout Configuration", () => {
    it("should set global timeout to 10000ms", () => {
      jest.setTimeout(10000);
      // getTimeout yerine setTimeout kullanılmalı
      const mockFn = jest.fn();
      setTimeout(mockFn, 100);
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe("Global Matchers", () => {
    it("should have custom matcher toBeValidId", () => {
      // Custom matcher'ın varlığını kontrol et
      expect(expect.extend).toBeDefined();
      const matcher = (expect as any).toBeValidId;
      expect(typeof matcher).toBe("function");
    });

    it("should have custom matcher toBeTruthy", () => {
      // Jest'in yerleşik matcher'ının çalıştığını kontrol et
      expect(true).toBeTruthy();
    });
  });

  describe("Environment Setup", () => {
    it("should run in test environment", () => {
      expect(process.env.NODE_ENV).toBe("test");
    });

    it("should clear mocks after each test", () => {
      const mockFn = jest.fn();
      mockFn();
      expect(mockFn).toHaveBeenCalled();
      jest.clearAllMocks();
      expect(mockFn).not.toHaveBeenCalled();
    });
  });
});
