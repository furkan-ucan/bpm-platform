import { expect } from 'vitest'
import { Types } from "mongoose";

export function toBeValidId(received: any): jest.CustomMatcherResult {
  const pass = Types.ObjectId.isValid(received);

  return {
    message: () =>
      pass
        ? `Beklenen ${received} geçerli bir MongoDB ObjectId olmamalıydı`
        : `Beklenen ${received} geçerli bir MongoDB ObjectId olmalıydı`,
    pass,
  };
}

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidId(): T
  }
}
