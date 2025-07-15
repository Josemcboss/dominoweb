export type GameState = 'LOBBY' | 'WAITING_FOR_PLAYERS' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER';
// import type { Game, Player, Tile, Move, RoundResult } from '../types';
export interface Tile {
  id: string;
  a: number;
  b: number;
}

export interface Player {
  id: string; // Unique identifier for the player
  name: string;
  hand: Tile[];
  team: 'A' | 'B';
  isHost: boolean;
  isBot?: boolean;
}

export interface RoundResult {
  winningTeam: 'A' | 'B';
  points: number;
  reason: 'Dominó' | 'Trancado';
  capicua: boolean;
  winnerName: string;
}

export interface Game {
    id: string;
    players: Player[];
    gameState: GameState;
    layout: Tile[];
    layoutEnds: (number | null)[];
    currentPlayerIndex: number;
    scores: { A: number; B: number };
    roundStarterIndex: number;
    passes: number;
    roundResult: RoundResult | null;
    gameMessage: string;
    hostId: string;
}

export type MoveAction = 'play' | 'pass';

export interface Move {
    action: MoveAction;
    tile?: Tile; // only for 'play' action
}
