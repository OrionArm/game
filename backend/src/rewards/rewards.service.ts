import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { 
  rewards, 
  playerRewards, 
  achievements, 
  playerAchievements,
  type NewPlayerReward 
} from './rewards.schema';
import { 
  ClaimRewardDto, 
  RewardsResponseDto, 
  ClaimRewardResponseDto,
  AchievementsResponseDto 
} from './rewards.dto';
import { eq, and, isNull, or, gt } from 'drizzle-orm';
import { players } from '../player/player.schema';

@Injectable()
export class RewardsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getAvailableRewards(userId: number): Promise<RewardsResponseDto> {
    // Получаем игрока
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    // Получаем все активные награды
    const availableRewards = await this.drizzleService.db
      .select()
      .from(rewards)
      .where(
        and(
          eq(rewards.isActive, true),
          or(
            isNull(rewards.expiresAt),
            gt(rewards.expiresAt, new Date()) // Проверяем, что награда не истекла
          )
        )
      );

    // Получаем уже полученные награды
    const claimedRewards = await this.drizzleService.db
      .select({ rewardId: playerRewards.rewardId })
      .from(playerRewards)
      .where(eq(playerRewards.playerId, player.id));

    const claimedRewardIds = new Set(claimedRewards.map(r => r.rewardId));

    const rewardsWithStatus = availableRewards.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description || '',
      type: reward.type,
      requirements: reward.requirements,
      rewards: reward.rewards,
      isActive: reward.isActive,
      expiresAt: reward.expiresAt?.toISOString() || null,
      isClaimed: claimedRewardIds.has(reward.id),
      canClaim: !claimedRewardIds.has(reward.id) && this.checkRewardRequirements(player, reward.requirements),
    }));

    return {
      rewards: rewardsWithStatus,
      totalRewards: rewardsWithStatus.length,
    };
  }

  async claimReward(userId: number, claimDto: ClaimRewardDto): Promise<ClaimRewardResponseDto> {
    const { rewardId } = claimDto;

    // Получаем игрока
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    // Получаем награду
    const [reward] = await this.drizzleService.db
      .select()
      .from(rewards)
      .where(
        and(
          eq(rewards.id, rewardId),
          eq(rewards.isActive, true)
        )
      )
      .limit(1);

    if (!reward) {
      throw new NotFoundException('Награда не найдена');
    }

    // Проверяем, не получена ли уже награда
    const [existingClaim] = await this.drizzleService.db
      .select()
      .from(playerRewards)
      .where(
        and(
          eq(playerRewards.playerId, player.id),
          eq(playerRewards.rewardId, rewardId)
        )
      )
      .limit(1);

    if (existingClaim) {
      throw new BadRequestException('Награда уже получена');
    }

    // Проверяем требования
    if (!this.checkRewardRequirements(player, reward.requirements)) {
      throw new BadRequestException('Требования для получения награды не выполнены');
    }

    // Выдаем награду
    const newPlayerReward: NewPlayerReward = {
      playerId: player.id,
      rewardId,
      isClaimed: true,
    };

    await this.drizzleService.db.insert(playerRewards).values(newPlayerReward);

    // TODO: Применить награды к игроку (золото, опыт, предметы и т.д.)

    return {
      success: true,
      rewardsReceived: reward.rewards,
      message: 'Награда успешно получена!',
    };
  }

  async getAchievements(userId: number): Promise<AchievementsResponseDto> {
    // Получаем игрока
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    // Получаем все достижения
    const allAchievements = await this.drizzleService.db
      .select()
      .from(achievements);

    // Получаем разблокированные достижения
    const unlockedAchievements = await this.drizzleService.db
      .select({
        achievementId: playerAchievements.achievementId,
        unlockedAt: playerAchievements.unlockedAt,
        progress: playerAchievements.progress,
      })
      .from(playerAchievements)
      .where(eq(playerAchievements.playerId, player.id));

    const unlockedAchievementIds = new Set(unlockedAchievements.map(a => a.achievementId));
    const unlockedMap = new Map(unlockedAchievements.map(a => [a.achievementId, a]));

    const achievementsWithStatus = allAchievements.map(achievement => {
      const unlocked = unlockedMap.get(achievement.id);
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description || '',
        category: achievement.category,
        requirements: achievement.requirements,
        rewards: achievement.rewards,
        isHidden: achievement.isHidden,
        isUnlocked: unlockedAchievementIds.has(achievement.id),
        progress: unlocked?.progress || this.calculateAchievementProgress(player, achievement.requirements),
        unlockedAt: unlocked?.unlockedAt.toISOString(),
      };
    });

    const unlockedCount = achievementsWithStatus.filter(a => a.isUnlocked).length;

    return {
      achievements: achievementsWithStatus,
      totalAchievements: achievementsWithStatus.length,
      unlockedCount,
    };
  }

  private checkRewardRequirements(player: any, requirements: any): boolean {
    if (!requirements) return true;

    // Простая проверка требований (можно расширить)
    if (requirements.level && player.level < requirements.level) {
      return false;
    }

    if (requirements.gold && player.gold < requirements.gold) {
      return false;
    }

    return true;
  }

  private calculateAchievementProgress(player: any, requirements: any): any {
    if (!requirements) return {};

    // Простой расчет прогресса (можно расширить)
    const progress: any = {};

    if (requirements.level) {
      progress.level = {
        current: player.level,
        required: requirements.level,
        percentage: Math.min((player.level / requirements.level) * 100, 100),
      };
    }

    if (requirements.gold) {
      progress.gold = {
        current: player.gold,
        required: requirements.gold,
        percentage: Math.min((player.gold / requirements.gold) * 100, 100),
      };
    }

    return progress;
  }
}
