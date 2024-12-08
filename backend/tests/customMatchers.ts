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

// TypeScript için global tip tanımlamaları
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidId(): R;
    }
  }
}
