import { IResolvers } from '@graphql-tools/utils';
import { Request } from 'express';
import { Database, User } from '../../../types';
import {
  UserArgs,
  UserWishlistArgs,
  UserWishlistData,
  UserGamesArgs,
  UserGamesData,
} from './types';
import { auth } from '../../../utils';

export const userResolvers: IResolvers = {
  Query: {
    user: async (
      _root: undefined,
      { id }: UserArgs,
      { db, req }: { db: Database; req: Request },
    ): Promise<User> => {
      try {
        const user = await db.users.findOne({ _id: id });
        if (!user) throw new Error(`User with id[${id}] not found`);

        const viewer = await auth(db, req);
        if (viewer && viewer._id === user._id) user.authorized = true;

        return user;
      } catch (e) {
        throw new Error(`Failed to query user ${e}`);
      }
    },
  },
  User: {
    id: (user: User): string => user._id,
    games: async (
      user: User,
      { limit, page }: UserGamesArgs,
      { db }: { db: Database },
    ): Promise<UserGamesData | null> => {
      try {
        const data: UserGamesData = {
          total: 0,
          result: [],
        };

        const cursor = await db.games.find({
          _id: { $in: user.games },
        });

        cursor.skip(page > 0 ? (page - 1) * limit : 0);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (e) {
        throw new Error(`Failed to query user games ${e}`);
      }
    },
    wishlist: async (
      user: User,
      { limit, page }: UserWishlistArgs,
      { db }: { db: Database },
    ): Promise<UserWishlistData | null> => {
      try {
        if (!user.authorized) return null;

        const data: UserWishlistData = {
          total: 0,
          result: [],
        };

        const cursor = await db.wishlist.find({
          _id: { $in: user.wishlist },
        });

        cursor.skip(page > 0 ? (page - 1) * limit : 0);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (e) {
        throw new Error(`Failed to query user wishlist ${e}`);
      }
    },
  },
};
