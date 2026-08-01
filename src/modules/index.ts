import type { FastifyInstance } from 'fastify';

import { API_PREFIX } from '@common/constants/app';
import { authRoutes } from '@modules/auth';
import { collectionsRoutes } from '@modules/collections';
import { favoritesRoutes } from '@modules/favorites';
import { journalRoutes } from '@modules/journal';
import { ratingsRoutes } from '@modules/ratings';
import { recommendationsRoutes } from '@modules/recommendations';
import { statisticsRoutes } from '@modules/statistics';
import { tmdbRoutes } from '@modules/tmdb';
import { usersRoutes } from '@modules/users';
import { watchlistRoutes } from '@modules/watchlist';

/**
 * Registers all feature modules under the versioned API prefix.
 * Modules are independently scaffolded; implement features one at a time.
 */
export async function registerModules(app: FastifyInstance): Promise<void> {
  await app.register(authRoutes, { prefix: API_PREFIX });
  await app.register(usersRoutes, { prefix: API_PREFIX });
  await app.register(tmdbRoutes, { prefix: API_PREFIX });
  await app.register(watchlistRoutes, { prefix: API_PREFIX });
  await app.register(favoritesRoutes, { prefix: API_PREFIX });
  await app.register(ratingsRoutes, { prefix: API_PREFIX });
  await app.register(journalRoutes, { prefix: API_PREFIX });
  await app.register(collectionsRoutes, { prefix: API_PREFIX });
  await app.register(statisticsRoutes, { prefix: API_PREFIX });
  await app.register(recommendationsRoutes, { prefix: API_PREFIX });
}
