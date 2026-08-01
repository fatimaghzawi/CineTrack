import mongoose from 'mongoose';

import { env } from '../src/config/env';

async function testMongo(): Promise<boolean> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5_000,
    });

    const ping = await mongoose.connection.db?.admin().command({ ping: 1 });
    const ok = ping?.ok === 1;

    console.log(
      ok
        ? `MongoDB: OK (db="${mongoose.connection.name}", host="${mongoose.connection.host}")`
        : 'MongoDB: FAILED (ping did not return ok)',
    );

    return ok;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`MongoDB: FAILED (${message})`);
    return false;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

async function testTmdb(): Promise<boolean> {
  try {
    const url = new URL(`${env.TMDB_BASE_URL}/configuration`);
    url.searchParams.set('api_key', env.TMDB_API_KEY);

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      console.log(`TMDb: FAILED (HTTP ${response.status})`);
      return false;
    }

    const data = (await response.json()) as { images?: { secure_base_url?: string } };
    const base = data.images?.secure_base_url;

    console.log(
      base ? `TMDb: OK (images base URL available)` : 'TMDb: OK (configuration reachable)',
    );
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`TMDb: FAILED (${message})`);
    return false;
  }
}

async function main(): Promise<void> {
  console.log('Checking CineTrack integrations...\n');

  const mongoOk = await testMongo();
  const tmdbOk = await testTmdb();

  console.log('\nSummary');
  console.log(`- MongoDB: ${mongoOk ? 'working' : 'not working'}`);
  console.log(`- TMDb:    ${tmdbOk ? 'working' : 'not working'}`);

  process.exit(mongoOk && tmdbOk ? 0 : 1);
}

void main();
