/**
 * Collections repository — database access only.
 * No HTTP concerns and no business rules.
 */

export class CollectionsRepository {
  isReady(): boolean {
    return true;
  }

  // Persistence methods will be added during implementation.
}

export const collectionsRepository = new CollectionsRepository();
