import { Module } from '@nestjs/common';
import { ShortUrlModule } from './shorten/short_url.module';
import { DrizzleModule } from './db/drizzle.module';
import { AppController } from './app.controller';

@Module({
  imports: [DrizzleModule, ShortUrlModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
