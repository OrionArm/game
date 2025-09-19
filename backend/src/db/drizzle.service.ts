// src/drizzle/drizzle.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as shorten from '../shorten/short_url.schema';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  public readonly db: NodePgDatabase<typeof shorten>;
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(this.pool, {
      schema: {
        ...shorten,
      },
      logger: true,
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async runMigrations() {
    const { migrate } = await import('drizzle-orm/node-postgres/migrator');
    await migrate(this.db, {
      migrationsFolder: './migrations',
    });
  }

  async closeConnection() {
    await this.pool.end();
  }
}
