export class LeaderboardEntryDto {
  rank: number;
  playerId: number;
  playerName: string;
  score: number;
}

export class LeaderboardResponseDto {
  entries: LeaderboardEntryDto[];
  totalPlayers: number;
  lastUpdated: string;
}

export class PlayerRankResponseDto {
  playerId: number;
  playerName: string;
  rank: number;
  score: number;
  totalPlayers: number;
}

export class PlayerStatsDto {
  totalKills: number;
  totalDeaths: number;
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalDistanceTraveled: number;
  totalEncountersCompleted: number;
  totalPlayTime: number;
  killDeathRatio: number;
}
