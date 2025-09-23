import { Controller, Get, Post, Body, ValidationPipe } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { 
  ClaimRewardDto, 
  RewardsResponseDto, 
  ClaimRewardResponseDto,
  AchievementsResponseDto 
} from './rewards.dto';

@Controller('api/rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  async getAvailableRewards(): Promise<RewardsResponseDto> {
    // TODO: Получить userId из токена аутентификации
    const userId = 1; // Временная заглушка
    return this.rewardsService.getAvailableRewards(userId);
  }

  @Post('claim')
  async claimReward(
    @Body(new ValidationPipe()) claimDto: ClaimRewardDto,
  ): Promise<ClaimRewardResponseDto> {
    // TODO: Получить userId из токена аутентификации
    const userId = 1; // Временная заглушка
    return this.rewardsService.claimReward(userId, claimDto);
  }

  @Get('achievements')
  async getAchievements(): Promise<AchievementsResponseDto> {
    // TODO: Получить userId из токена аутентификации
    const userId = 1; // Временная заглушка
    return this.rewardsService.getAchievements(userId);
  }
}
