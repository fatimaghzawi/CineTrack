import { NotFoundError } from '@common/errors';
import type { PaginatedData } from '@common/types/api';
import { paginated } from '@common/utils/response';

import type { JournalRepository } from './journal.repository';
import type {
  CreateJournalEntryData,
  JournalEntry,
  JournalListFilters,
  UpdateJournalEntryData,
} from './journal.types';

/**
 * Journal service — personal diary entry business logic.
 */
export class JournalService {
  constructor(private readonly repository: JournalRepository) {}

  async create(userId: string, data: CreateJournalEntryData): Promise<JournalEntry> {
    return this.repository.create(userId, data);
  }

  async getById(userId: string, id: string): Promise<JournalEntry> {
    const entry = await this.repository.findByIdForUser(id, userId);
    if (!entry) {
      throw new NotFoundError('Journal entry not found');
    }
    return entry;
  }

  async list(
    userId: string,
    filters: JournalListFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedData<JournalEntry>> {
    const { items, total } = await this.repository.listForUser(userId, filters, page, limit);
    return paginated(items, page, limit, total);
  }

  async update(userId: string, id: string, data: UpdateJournalEntryData): Promise<JournalEntry> {
    const entry = await this.repository.updateByIdForUser(id, userId, data);
    if (!entry) {
      throw new NotFoundError('Journal entry not found');
    }
    return entry;
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await this.repository.deleteByIdForUser(id, userId);
    if (!deleted) {
      throw new NotFoundError('Journal entry not found');
    }
  }
}

export const createJournalService = (repository: JournalRepository): JournalService =>
  new JournalService(repository);
