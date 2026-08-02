/**
 * Collections module public barrel.
 */

export { default as collectionsRoutes } from './collections.routes';
export { CollectionsService, createCollectionsService } from './collections.service';
export { CollectionsRepository, collectionsRepository } from './collections.repository';
export { CollectionsController, createCollectionsController } from './collections.controller';
export { CollectionModel } from './collections.model';
export type {
  Collection,
  CollectionItem,
  CreateCollectionData,
  UpdateCollectionData,
  AddCollectionItemData,
  CollectionListFilters,
} from './collections.types';
export {
  createCollectionSchema,
  updateCollectionSchema,
  collectionIdParamsSchema,
  addCollectionItemSchema,
  removeCollectionItemSchema,
  listCollectionsQuerySchema,
} from './collections.schema';
export type {
  CreateCollectionInput,
  UpdateCollectionInput,
  CollectionIdParams,
  AddCollectionItemInput,
  RemoveCollectionItemInput,
  ListCollectionsQuery,
} from './collections.schema';
