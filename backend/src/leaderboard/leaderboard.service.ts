import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { 
  leaderboard, 
  playerStats, 
  type NewLeaderboardEntry,
  type NewPlayerStats 
} from './leaderboard.schema';
import { 
  LeaderboardResponseDto, 
  PlayerRankResponseDto, 
  PlayerStatsDto 
} from './leaderboard.dto';
import { eq, desc, asc, and } from 'drizzle-orm';
import { players } from '../player/player.schema';

@Injectable()
export class LeaderboardService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getLeaderboard(limit: number = 100): Promise<LeaderboardResponseDto> {
    const leaderboardEntries = await this.drizzleService.db
      .select({
        rank: leaderboard.rank,
        playerId: leaderboard.playerId,
        score: leaderboard.score,
        playerName: players.name,
      })
      .from(leaderboard)
      .innerJoin(players, eq(leaderboard.playerId, players.id))
      .orderBy(asc(leaderboard.rank))
      .limit(limit);

    const totalPlayers = await this.drizzleService.db
      .select({ count: leaderboard.playerId })
      .from(leaderboard)

    return {
      entries: leaderboardEntries.map(entry => ({
        rank: entry.rank,
        playerId: entry.playerId,
        playerName: entry.playerName,
        score: entry.score,
      })),
      totalPlayers: totalPlayers.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getPlayerRank(userId: number, category: string = 'overall'): Promise<PlayerRankResponseDto> {
    // Получаем игрока
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    // Получаем позицию в рейтинге
    const [rankEntry] = await this.drizzleService.db
      .select()
      .from(leaderboard)
      .where(
        and(
          eq(leaderboard.playerId, player.id),
        )
      )
      .limit(1);

    if (!rankEntry) {
      // Если игрока нет в рейтинге, создаем запись
      await this.updatePlayerRank(player.id, category);
      return this.getPlayerRank(userId, category);
    }

    const totalPlayers = await this.drizzleService.db
      .select({ count: leaderboard.playerId })
      .from(leaderboard)

    return {
      playerId: player.id,
      playerName: player.name,
      rank: rankEntry.rank,
      score: rankEntry.score,
      totalPlayers: totalPlayers.length,
    };
  }

  async getPlayerStats(userId: number): Promise<PlayerStatsDto> {
    // Получаем игрока
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    // Получаем статистику игрока
    const [stats] = await this.drizzleService.db
      .select()
      .from(playerStats)
      .where(eq(playerStats.playerId, player.id))
      .limit(1);

    if (!stats) {
      // Создаем начальную статистику
      const newStats: NewPlayerStats = {
        playerId: player.id,
        totalKills: 0,
        totalDeaths: 0,
        totalGoldEarned: 0,
        totalGoldSpent: 0,
        totalDistanceTraveled: 0,
        totalEncountersCompleted: 0,
        totalPlayTime: 0,
      };

      const [createdStats] = await this.drizzleService.db
        .insert(playerStats)
        .values(newStats)
        .returning();

      return this.mapStatsToDto(createdStats);
    }

    return this.mapStatsToDto(stats);
  }

  async updatePlayerRank(playerId: number, category: string): Promise<void> {
    // Получаем игрока
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    let score = player.cristal;

    // Обновляем или создаем запись в рейтинге
    const [existingEntry] = await this.drizzleService.db
      .select()
      .from(leaderboard)
      .where(
        and(
          eq(leaderboard.playerId, playerId),
        )
      )
      .limit(1);

    if (existingEntry) {
      await this.drizzleService.db
        .update(leaderboard)
        .set({
          score,
          lastUpdated: new Date(),
        })
        .where(eq(leaderboard.id, existingEntry.id));
    } else {
      const newEntry: NewLeaderboardEntry = {
        playerId,
        score,
        rank: 999, // Временный ранг, будет обновлен при пересчете
      };

      await this.drizzleService.db.insert(leaderboard).values(newEntry);
    }

    // Пересчитываем ранги для категории
    await this.recalculateRanks();
  }

  private async recalculateRanks(): Promise<void> {
    // Получаем всех игроков в категории, отсортированных по очкам
    const entries = await this.drizzleService.db
      .select()
      .from(leaderboard)
      .orderBy(desc(leaderboard.score));

    // Обновляем ранги
    for (let i = 0; i < entries.length; i++) {
      await this.drizzleService.db
        .update(leaderboard)
        .set({ rank: i + 1 })
        .where(eq(leaderboard.id, entries[i].id));
    }
  }

  private mapStatsToDto(stats: any): PlayerStatsDto {
    const killDeathRatio = stats.totalDeaths > 0 ? stats.totalKills / stats.totalDeaths : stats.totalKills;

    return {
      totalKills: stats.totalKills,
      totalDeaths: stats.totalDeaths,
      totalGoldEarned: stats.totalGoldEarned,
      totalGoldSpent: stats.totalGoldSpent,
      totalDistanceTraveled: stats.totalDistanceTraveled,
      totalEncountersCompleted: stats.totalEncountersCompleted,
      totalPlayTime: stats.totalPlayTime,
      killDeathRatio: Math.round(killDeathRatio * 100) / 100,
    };
  }
}
