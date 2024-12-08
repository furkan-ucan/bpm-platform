import { Types } from "mongoose";

export function toBeValidId(received: string | Types.ObjectId): { message: () => string; pass: boolean } {
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
  interface Assertion {
    toBeValidId(): Assertion;
  }
}
