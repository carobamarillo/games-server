import { Collection, ObjectId } from 'mongodb';

export enum GameType {
  VideoSlot = 'VIDEOSLOT',
  SlotMachines = 'SLOTMACHINES',
}

export interface Viewer {
  _id?: string;
  token?: string;
  avatar?: string;
  walletId?: string;
  didRequest: boolean;
}

export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  wishlist: ObjectId[];
  games: ObjectId[];
  authorized?: boolean;

  /**
   * TODO: delete this just
   * for stripe integration
   * wallleId
   * income
   */
  walletId?: string;
  income: number;
}

export interface Game {
  _id: ObjectId;
  name: string;
  description: string;
  code: string;
  icon: string;
  type: GameType;
  url: string;
  wishlist: ObjectId[];
  authorized: boolean;
}

export interface Wishlist {
  _id: ObjectId;
  game: ObjectId;
}

export interface Database {
  games: Collection<Game>;
  users: Collection<User>;
  wishlist: Collection<Wishlist>;
}
