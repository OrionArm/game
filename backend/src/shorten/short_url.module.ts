import { Module } from '@nestjs/common';
import { ShortUrlService } from './short_url.service';
import { DrizzleModule } from '../db/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [],
  providers: [ShortUrlService],
  exports: [ShortUrlService],
})
export class ShortUrlModule {}
