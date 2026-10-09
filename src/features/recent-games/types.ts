/** One previously played game. The backend will return an array of these. */
export type RecentGame = {
  id: string;
  editionNo: number;
  gameType: string;
  gameLabel: string;
  topic: string;
  playedAt: string;
  score: number;
  maxScore?: number;
};