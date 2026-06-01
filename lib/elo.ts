/**
 * Standard Elo update. K=32 is the chess-classic value, fine for our scale.
 * Returns new ratings for [winner, loser].
 */
export function updateElo(
  winner: number,
  loser: number,
  k = 32
): [number, number] {
  const expectedWinner = 1 / (1 + Math.pow(10, (loser - winner) / 400));
  const expectedLoser = 1 - expectedWinner;
  const newWinner = winner + k * (1 - expectedWinner);
  const newLoser = loser + k * (0 - expectedLoser);
  return [newWinner, newLoser];
}

export const STARTING_ELO = 1000;
