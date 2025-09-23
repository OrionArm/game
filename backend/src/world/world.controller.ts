import { Controller, Get, Post, Param, Body, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { WorldService } from './world.service';
import { ResolveEncounterDto, WorldStateResponseDto, EncounterResponseDto, EncounterResolutionResponseDto } from './world.dto';

@Controller('api/world')
export class WorldController {
  constructor(private readonly worldService: WorldService) {}

  @Get()
  async getWorldState(): Promise<WorldStateResponseDto> {
    return this.worldService.getWorldState();
  }

  @Get('encounters/:id')
  async getEncounter(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EncounterResponseDto> {
    return this.worldService.getEncounter(id);
  }

  @Post('encounters/:id/resolve')
  async resolveEncounter(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) resolveDto: ResolveEncounterDto,
  ): Promise<EncounterResolutionResponseDto> {
    // TODO: Получить userId из токена аутентификации
    const userId = 1; // Временная заглушка
    return this.worldService.resolveEncounter(id, userId, resolveDto);
  }
}
