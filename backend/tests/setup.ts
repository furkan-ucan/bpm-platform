import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { toBeValidId } from "./customMatchers";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    // Mongoose 7+ için bu opsiyonlar artık gerekli değil
  });

  jest.setTimeout(10000);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Test veritabanını her testten sonra temizle
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  jest.clearAllMocks();
});

// Custom matcher'ları ekle
expect.extend({ toBeValidId });

// Global tip tanımlamaları
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidId(): R;
    }
  }
}
