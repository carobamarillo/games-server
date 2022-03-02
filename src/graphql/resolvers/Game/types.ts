import { Game } from '../../../types';

export enum GameType {
  VIDEOSLOT = 'VIDEOSLOT',
  SLOTMACHINES = 'SLOTMACHINES',
  ALL = 'ALL'
}

export interface GameArgs {
  id: string;
}

export interface GamesArgs {
  filter: GameType;
  limit: number;
  page: number;
}

export interface GamesData {
  total: number;
  result: Game[];
}
