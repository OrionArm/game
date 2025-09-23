import { IsNumber, IsNotEmpty } from 'class-validator';

export class ClaimRewardDto {
  @IsNumber()
  @IsNotEmpty()
  rewardId: number;
}

export class RewardDto {
  id: number;
  name: string;
  description: string;
  type: string;
  requirements: any;
  rewards: any;
  isActive: boolean;
  expiresAt: string | null;
  isClaimed?: boolean;
  canClaim?: boolean;
}

export class RewardsResponseDto {
  rewards: RewardDto[];
  totalRewards: number;
}

export class ClaimRewardResponseDto {
  success: boolean;
  rewardsReceived: any;
  message: string;
}

export class AchievementDto {
  id: number;
  name: string;
  description: string;
  category: string;
  requirements: any;
  rewards: any;
  isHidden: boolean;
  isUnlocked?: boolean;
  progress?: any;
  unlockedAt?: string;
}

export class AchievementsResponseDto {
  achievements: AchievementDto[];
  totalAchievements: number;
  unlockedCount: number;
}
