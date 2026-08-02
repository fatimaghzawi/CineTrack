import type { CollectionsRepository } from './collections.repository';

export class CollectionsService {
  constructor(private readonly repository: CollectionsRepository) {}

  getScaffoldStatus() {
    return {
      module: 'collections' as const,
      status: 'scaffold' as const,
      persistence: this.repository.isReady(),
    };
  }
}

export const createCollectionsService = (repository: CollectionsRepository): CollectionsService =>
  new CollectionsService(repository);
