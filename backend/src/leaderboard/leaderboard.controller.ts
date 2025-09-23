import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { 
  LeaderboardResponseDto, 
  PlayerRankResponseDto, 
  PlayerStatsDto 
} from './leaderboard.dto';

@Controller('api/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(
    @Query('limit', ParseIntPipe) limit: number = 100,
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getLeaderboard(limit);
  }

  @Get('my-rank')
  async getPlayerRank(
    @Query('category') category: string = 'overall',
  ): Promise<PlayerRankResponseDto> {
    // TODO: Получить userId из токена аутентификации
    const userId = 1; // Временная заглушка
    return this.leaderboardService.getPlayerRank(userId, category);
  }

  @Get('my-stats')
  async getPlayerStats(): Promise<PlayerStatsDto> {
    // TODO: Получить userId из токена аутентификации
    const userId = 1; // Временная заглушка
    return this.leaderboardService.getPlayerStats(userId);
  }
}
