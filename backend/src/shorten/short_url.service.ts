import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { count, desc, eq } from 'drizzle-orm';
import { DrizzleService } from '../db/drizzle.service';
import { CreateShortUrlDto } from './create-short-url.dto';
import { shortUrlsTable, ShortUrl } from './short_url.schema';
import { urlVisitsTable } from './url_visits.schema';

@Injectable()
export class ShortUrlService {
  constructor(private readonly drizzle: DrizzleService) {}

  private generateRandomCode(length = 6): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
  }

  async create(data: CreateShortUrlDto): Promise<ShortUrl> {
    const db = this.drizzle.db;
    const shortCode = this.generateRandomCode(6);

    // Проверка уникальности alias
    if (data.alias) {
      const existing = await db
        .select()
        .from(shortUrlsTable)
        .where(eq(shortUrlsTable.alias, data.alias));

      if (existing.length > 0) {
        throw new ConflictException('Alias already in use');
      }
    } else {
      const existing = await db
        .select()
        .from(shortUrlsTable)
        .where(eq(shortUrlsTable.alias, shortCode));

      if (existing.length > 0) {
        // рекурсивно попробовать ещё раз
        return this.create(data);
      }
    }

    const result = await db
      .insert(shortUrlsTable)
      .values({
        url: data.url,
        alias: data.alias || shortCode,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      })
      .returning();

    return result.at(0);
  }

  async get(alias: string): Promise<ShortUrl | null> {
    const [result] = await this.drizzle.db
      .select()
      .from(shortUrlsTable)
      .where(eq(shortUrlsTable.alias, alias))
      .limit(1);

    return result || null;
  }

  private async getOriginalUrl(alias: string): Promise<string | null> {
    const [result] = await this.drizzle.db
      .select({ originalUrl: shortUrlsTable.url })
      .from(shortUrlsTable)
      .where(eq(shortUrlsTable.alias, alias))
      .limit(1);

    return result.originalUrl ?? null;
  }

  async redirectToOriginal(alias: string, ipAddress: string) {
    return this.drizzle.db.transaction(async (tx) => {
      const url = await this.getOriginalUrl(alias);
      if (!url) {
        throw new NotFoundException('URL not found');
      }
      await tx.insert(urlVisitsTable).values({
        alias,
        ipAddress,
      });

      return url;
    });
  }

  async deleteUrl(alias: string): Promise<void> {
    const originalUrl = await this.getOriginalUrl(alias);

    if (!originalUrl) {
      throw new NotFoundException('Short URL not found');
    }

    await this.drizzle.db
      .delete(shortUrlsTable)
      .where(eq(shortUrlsTable.alias, alias));

    return;
  }

  async analytics(
    alias: string,
  ): Promise<{ totalClicks: number; recentIps: string[] }> {
    const urlRecord = await this.get(alias);
    if (!urlRecord.id) {
      throw new NotFoundException('Short URL not found');
    }

    const [totalClicks, recentIps] = await Promise.all([
      this.getTotalClicks(urlRecord.alias),
      this.getRecentIps(urlRecord.alias),
    ]);

    return {
      totalClicks,
      recentIps,
    };
  }

  private async getTotalClicks(alias: string) {
    return this.drizzle.db
      .select({ count: count() })
      .from(urlVisitsTable)
      .where(eq(urlVisitsTable.alias, alias))
      .then((res) => res[0]?.count || 0);
  }

  private async getRecentIps(alias: string, limit = 5): Promise<string[]> {
    return this.drizzle.db
      .select({
        ip: urlVisitsTable.ipAddress,
      })
      .from(urlVisitsTable)
      .where(eq(urlVisitsTable.alias, alias))
      .orderBy(desc(urlVisitsTable.visitedAt))
      .limit(limit)
      .then((res) => res.map(({ ip }) => ip));
  }
}
