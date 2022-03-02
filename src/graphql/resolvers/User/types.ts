import { Wishlist, Game } from '../../../types';

export interface UserArgs {
  id: string;
}

export interface UserWishlistArgs {
  limit: number;
  page: number;
}

export interface UserWishlistData {
  total: number;
  result: Wishlist[];
}


export interface UserGamesArgs {
  limit: number;
  page: number;
}

export interface UserGamesData {
  total: number;
  result: Game[];
}