import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { PlayerService } from './player.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { 
  PlayerStateResponseDto, 
  PlayerInventoryDto, 
  MoveResponseDto 
} from './player.dto';

@Controller('api/player')
@UseGuards(JwtAuthGuard)
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('state')
  async getPlayerState(@Request() req): Promise<PlayerStateResponseDto> {
    const userId = req.user.id;
    return this.playerService.getPlayerState(userId);
  }

  @Post('move')
  async movePlayer(@Request() req): Promise<MoveResponseDto> {
    const userId = req.user.id;
    return this.playerService.movePlayer(userId);
  }

  @Get('inventory')
  async getPlayerInventory(@Request() req): Promise<PlayerInventoryDto> {
    const userId = req.user.id;
    return this.playerService.getPlayerInventory(userId);
  }
}
