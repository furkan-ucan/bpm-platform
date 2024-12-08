import { Types } from "mongoose";
import { vi } from 'vitest'

export const generateObjectId = () => new Types.ObjectId();

export const createTestDate = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

export const mockMongooseDocument = (data: any) => ({
  ...data,
  toObject: vi.fn().mockReturnValue(data),
  toJSON: vi.fn().mockReturnValue(data),
});
