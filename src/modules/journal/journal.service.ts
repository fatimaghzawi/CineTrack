import type { JournalRepository } from './journal.repository';

export class JournalService {
  constructor(private readonly repository: JournalRepository) {}

  getScaffoldStatus() {
    return {
      module: 'journal' as const,
      status: 'scaffold' as const,
      persistence: this.repository.isReady(),
    };
  }
}

export const createJournalService = (repository: JournalRepository): JournalService =>
  new JournalService(repository);
