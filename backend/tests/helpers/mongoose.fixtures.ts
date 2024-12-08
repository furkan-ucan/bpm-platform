import { Document, Model, Types } from "mongoose";

// Document için temel özellikleri tanımlayalım
interface BaseDocument {
  _id: Types.ObjectId;
  id?: string;
  getChanges: () => object;
  $parent: () => any;
}

export const createMongooseDocumentMethods = () => ({
  $assertPopulated: jest.fn(),
  $getAllSubdocs: jest.fn(),
  $ignore: jest.fn(),
  $isDefault: jest.fn(),
  $isDeleted: jest.fn(),
  $isEmpty: jest.fn(),
  $isValid: jest.fn(),
  $markValid: jest.fn(),
  $clone: jest.fn(),
  $getPopulatedDocs: jest.fn(),
  $inc: jest.fn(),
  $locals: {},
  $op: null,
  $session: jest.fn(),
  $set: jest.fn(),
  $where: jest.fn(),
  collection: {},
  db: {},
  delete: jest.fn(),
  deleteOne: jest.fn(),
  depopulate: jest.fn(),
  directModifiedPaths: jest.fn(),
  equals: jest.fn(),
  errors: {},
  get: jest.fn(),
  increment: jest.fn(),
  init: jest.fn(),
  inspect: jest.fn(),
  invalidate: jest.fn(),
  isModified: jest.fn(),
  isNew: false,
  isSelected: jest.fn(),
  markModified: jest.fn(),
  model: jest.fn(),
  modifiedPaths: jest.fn(),
  overwrite: jest.fn(),
  populate: jest.fn(),
  populated: jest.fn(),
  remove: jest.fn(),
  replaceOne: jest.fn(),
  save: jest.fn(),
  schema: {},
  set: jest.fn(),
  toJSON: jest.fn(),
  toObject: jest.fn().mockReturnThis(),
  unmarkModified: jest.fn(),
  update: jest.fn(),
  updateOne: jest.fn(),
  validate: jest.fn(),
  validateSync: jest.fn(),
  isDirectModified: jest.fn(),
  isDirectSelected: jest.fn(),
  isInit: jest.fn(),
  $clearModifiedPaths: jest.fn(),
  $createModifiedPathsSnapshot: jest.fn(),
  $model: {} as Model<any>,
  $restoreModifiedPathsSnapshot: jest.fn(),
  $__: {},
  syncIndexes: jest.fn(),
  // Document interface'inden gelen zorunlu metodlar
  getChanges: jest.fn().mockReturnValue({}),
  $parent: jest.fn().mockReturnValue(null),
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
