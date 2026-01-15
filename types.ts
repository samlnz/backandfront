
export type BingoLetter = 'B' | 'I' | 'N' | 'G' | 'O';

export interface Card {
  id: number;
  numbers: number[]; // 25 numbers, column-major
  type: string;
}

export interface WinningPattern {
  name: string;
  cells: number[]; // Indices 0-24
}

export interface PlayerWinData {
  playerName: string;
  playerId: string;
  cardNumbers: number[];
  winningLines: {
    card1: string[];
    card2: string[];
  };
  totalLines: number;
  gameTime: number;
  calledNumbersCount: number;
  cardData: {
    card1: CardResult;
    card2: CardResult;
  };
}

export interface CardResult {
  numbers: number[];
  markedNumbers: number[];
  winningCells: number[];
  winningLines: string[];
}

export enum GamePhase {
  SELECTION = 'SELECTION',
  PLAYING = 'PLAYING',
  WINNER = 'WINNER'
}

// Global Sync Constants
export const SYNC_CONFIG = {
  SELECTION_DURATION: 60, // 1 minute selection
  WINNER_ANNOUNCEMENT_DURATION: 5, // 5 seconds announcement
  CALL_INTERVAL: 4, // 4 seconds per ball
  GENESIS_EPOCH: 1738368000, // Fixed starting point (Feb 1, 2025 00:00:00 UTC)
};
