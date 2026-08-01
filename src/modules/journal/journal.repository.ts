/**
 * Journal repository — database access only.
 * No HTTP concerns and no business rules.
 */

export class JournalRepository {
  isReady(): boolean {
    return true;
  }

  // Persistence methods will be added during implementation.
}

export const journalRepository = new JournalRepository();
