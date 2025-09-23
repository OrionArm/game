import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject } from 'class-validator';

export class ResolveEncounterDto {
  @IsString()
  @IsNotEmpty()
  resolution: string; // 'success', 'failure', 'fled'

  @IsOptional()
  @IsObject()
  choices?: Record<string, any>; // Дополнительные выборы игрока
}

export class WorldStateResponseDto {
  currentDay: number;
  activeEncounters: any[];
  worldEvents: any[];
  lastUpdated: string;
}

export class EncounterResponseDto {
  id: number;
  name: string;
  description: string;
  type: string;
  difficulty: number;
  rewards: any;
  requirements: any;
}

export class EncounterResolutionResponseDto {
  success: boolean;
  rewardsReceived: any;
  message: string;
}
