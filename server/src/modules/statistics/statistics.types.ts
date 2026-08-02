export type StatisticsTotals = {
  watchlist: number;
  completed: number;
  watching: number;
  planToWatch: number;
  dropped: number;
  favorites: number;
  ratings: number;
  journalEntries: number;
  collections: number;
};

export type StatisticsByMediaType = {
  movie: number;
  tv: number;
};

export type StatisticsRatingsSummary = {
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
};

export type StatisticsSnapshot = {
  id: string;
  userId: string;
  totals: StatisticsTotals;
  byMediaType: StatisticsByMediaType;
  ratings: StatisticsRatingsSummary;
  lastComputedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type StatisticsComputeResult = Omit<StatisticsSnapshot, 'id' | 'createdAt' | 'updatedAt'> & {
  userId: string;
};
