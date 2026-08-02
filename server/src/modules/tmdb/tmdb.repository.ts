import { AppError } from '@common/errors';
import { ErrorCode } from '@common/errors/error-codes';
import { env } from '@config/env';

import type { TmdbDiscoverParams, TmdbSearchParams, TmdbTrendingParams } from './tmdb.types';

type TmdbRequestOptions = {
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
};

/**
 * TMDb HTTP client — no MongoDB persistence for catalog titles.
 */
export class TmdbRepository {
  isReady(): boolean {
    return Boolean(env.TMDB_API_KEY && env.TMDB_BASE_URL);
  }

  async searchMulti(params: TmdbSearchParams): Promise<unknown> {
    return this.request({
      path: '/search/multi',
      query: {
        query: params.query,
        page: params.page ?? 1,
        include_adult: params.includeAdult ?? false,
      },
    });
  }

  async getMovie(id: number): Promise<unknown> {
    return this.request({ path: `/movie/${id}` });
  }

  async getTv(id: number): Promise<unknown> {
    return this.request({ path: `/tv/${id}` });
  }

  async getTrending(params: TmdbTrendingParams): Promise<unknown> {
    const mediaType = params.mediaType ?? 'all';
    const timeWindow = params.timeWindow ?? 'day';

    return this.request({
      path: `/trending/${mediaType}/${timeWindow}`,
      query: {
        page: params.page ?? 1,
      },
    });
  }

  async discoverMovies(params: TmdbDiscoverParams): Promise<unknown> {
    return this.request({
      path: '/discover/movie',
      query: {
        page: params.page ?? 1,
        sort_by: params.sortBy ?? 'popularity.desc',
      },
    });
  }

  async discoverTv(params: TmdbDiscoverParams): Promise<unknown> {
    return this.request({
      path: '/discover/tv',
      query: {
        page: params.page ?? 1,
        sort_by: params.sortBy ?? 'popularity.desc',
      },
    });
  }

  private async request({ path, query }: TmdbRequestOptions): Promise<unknown> {
    const url = new URL(`${env.TMDB_BASE_URL}${path}`);
    url.searchParams.set('api_key', env.TMDB_API_KEY);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
    } catch (error) {
      throw new AppError('Failed to reach TMDb', 503, {
        code: ErrorCode.SERVICE_UNAVAILABLE,
        cause: error,
      });
    }

    if (!response.ok) {
      const statusCode = response.status === 404 ? 404 : 502;
      const code = response.status === 404 ? ErrorCode.NOT_FOUND : ErrorCode.SERVICE_UNAVAILABLE;
      let details: unknown;

      try {
        details = await response.json();
      } catch {
        details = undefined;
      }

      throw new AppError(
        response.status === 404 ? 'TMDb resource not found' : 'TMDb request failed',
        statusCode,
        { code, details },
      );
    }

    return response.json();
  }
}

export const tmdbRepository = new TmdbRepository();
