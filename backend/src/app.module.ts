import { Module } from '@nestjs/common';
import { ShortUrlModule } from './shorten/short_url.module';
import { DrizzleModule } from './db/drizzle.module';
import { AuthModule } from './auth/auth.module';
import { WorldModule } from './world/world.module';
import { PlayerModule } from './player/player.module';
import { ShopModule } from './shop/shop.module';
import { RewardsModule } from './rewards/rewards.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    DrizzleModule, 
    ShortUrlModule,
    AuthModule,
    WorldModule,
    PlayerModule,
    ShopModule,
    RewardsModule,
    LeaderboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
