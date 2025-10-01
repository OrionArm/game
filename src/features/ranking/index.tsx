import { fetchNearbyPlayers, fetchPlayerRank, fetchRankedPlayers } from '@/shared/local_api';
import type { PlayerRanking as PlayerRankingType } from '@/shared/types';
import type { PlayerStateResponseDto } from '@/services/client_player_service';
import { use } from 'react';
import Leaderboard from './leaderboard';
import PlayerRanking from './player_ranking';

// Кэш для Promise рейтинга
const rankingCache = new Map<
  string,
  Promise<{
    allPlayers: PlayerRankingType[];
    currentPlayerRank: number;
    nearbyPlayers: PlayerRankingType[];
  }>
>();

// Компонент для загрузки данных рейтинга
export default function RankingDataLoader({
  playerState,
}: {
  playerState: PlayerStateResponseDto;
}) {
  const cacheKey = `ranking_${playerState.id}`;

  if (!rankingCache.has(cacheKey)) {
    rankingCache.set(
      cacheKey,
      Promise.all([
        fetchRankedPlayers(playerState),
        fetchPlayerRank(playerState),
        fetchNearbyPlayers(playerState, 2),
      ]).then(([allPlayers, currentPlayerRank, nearbyPlayers]) => ({
        allPlayers,
        currentPlayerRank,
        nearbyPlayers,
      })),
    );
  }

  const rankingData = use(rankingCache.get(cacheKey)!);

  // Отладочная информация
  console.log('Ranking data:', {
    allPlayers: rankingData.allPlayers.length,
    currentPlayerRank: rankingData.currentPlayerRank,
    nearbyPlayers: rankingData.nearbyPlayers.length,
    nearbyPlayersData: rankingData.nearbyPlayers,
  });

  return (
    <>
      <Leaderboard players={rankingData.allPlayers} />
      <PlayerRanking
        currentPlayer={playerState}
        nearbyPlayers={rankingData.nearbyPlayers}
        currentPlayerRank={rankingData.currentPlayerRank}
      />
    </>
  );
}
