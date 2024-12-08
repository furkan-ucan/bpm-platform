import { Types } from "mongoose";

export const generateObjectId = () => new Types.ObjectId();

export const createTestDate = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

export const mockMongooseDocument = (data: any) => ({
  ...data,
  toObject: jest.fn().mockReturnValue(data),
  toJSON: jest.fn().mockReturnValue(data),
});
