import { vi } from 'vitest'
import { type Document, type Model, Types } from "mongoose";

// Document için temel özellikleri tanımlayalım
interface BaseDocument {
  _id: Types.ObjectId;
  id?: string;
  getChanges: () => object;
  $parent: () => any;
}

export const createMongooseDocumentMethods = () => ({
  $assertPopulated: vi.fn(),
  $getAllSubdocs: vi.fn(),
  $ignore: vi.fn(),
  $isDefault: vi.fn(),
  $isDeleted: vi.fn(),
  $isEmpty: vi.fn(),
  $isValid: vi.fn(),
  $markValid: vi.fn(),
  $clone: vi.fn(),
  $getPopulatedDocs: vi.fn(),
  $inc: vi.fn(),
  $locals: {},
  $op: null,
  $session: vi.fn(),
  $set: vi.fn(),
  $where: vi.fn(),
  collection: {},
  db: {},
  delete: vi.fn(),
  deleteOne: vi.fn(),
  depopulate: vi.fn(),
  directModifiedPaths: vi.fn(),
  equals: vi.fn(),
  errors: {},
  get: vi.fn(),
  increment: vi.fn(),
  init: vi.fn(),
  inspect: vi.fn(),
  invalidate: vi.fn(),
  isModified: vi.fn(),
  isNew: false,
  isSelected: vi.fn(),
  markModified: vi.fn(),
  model: vi.fn(),
  modifiedPaths: vi.fn(),
  overwrite: vi.fn(),
  populate: vi.fn(),
  populated: vi.fn(),
  remove: vi.fn(),
  replaceOne: vi.fn(),
  save: vi.fn(),
  schema: {},
  set: vi.fn(),
  toJSON: vi.fn(),
  toObject: vi.fn().mockReturnThis(),
  unmarkModified: vi.fn(),
  update: vi.fn(),
  updateOne: vi.fn(),
  validate: vi.fn(),
  validateSync: vi.fn(),
  isDirectModified: vi.fn(),
  isDirectSelected: vi.fn(),
  isInit: vi.fn(),
  $clearModifiedPaths: vi.fn(),
  $createModifiedPathsSnapshot: vi.fn(),
  $model: {} as Model<any>,
  $restoreModifiedPathsSnapshot: vi.fn(),
  $__: {},
  syncIndexes: vi.fn(),
  // Document interface'inden gelen zorunlu metodlar
  getChanges: vi.fn().mockReturnValue({}),
  $parent: vi.fn().mockReturnValue(null),
  id: undefined,
});

export const createMockMongooseDocument = <T extends object>(
  data: T
): Document & T => {
  const documentMethods = createMongooseDocumentMethods();
  const _id = (data as any)._id || new Types.ObjectId();

  return {
    ...documentMethods,
    ...data,
    _id,
    id: _id.toString(),
  } as unknown as Document & T;
};
