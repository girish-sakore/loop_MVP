/** One completed game that can be launched again in replay mode. */
export type RecentGame = {
  id: string;
  editionId: string;
  nodeId: string;
  editionNo: number;
  gameType: string;
  gameLabel: string;
  topic: string;
  playedAt: string;
  score: number;
  maxScore?: number;
};
