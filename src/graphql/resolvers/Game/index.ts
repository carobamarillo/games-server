import { IResolvers } from '@graphql-tools/utils';
import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Database, Game } from '../../../types';
import { auth } from '../../../utils';
import { GameArgs, GamesArgs, GamesData, GameType } from './types';

export const gameResolvers: IResolvers = {
  Query: {
    game: async (
      _root: undefined,
      { id }: GameArgs,
      { db, req }: { db: Database; req: Request },
    ): Promise<Game> => {
      try {
        const game = await db.games.findOne({ _id: new ObjectId(id) });
        if (!game) throw new Error(`Game with id[${id} can't be found]`);
        const viewer = await auth(db, req);

        if (viewer && viewer.token) {
          viewer.authorized = true;
        }

        return game;
      } catch (e) {
        throw new Error('Failed to query game');
      }
    },
    games: async (
      _root: undefined,
      { filter, limit, page }: GamesArgs,
      { db, req }: { db: Database; req: Request },
    ): Promise<GamesData> => {
      try {
        const data: GamesData = {
          total: 0,
          result: [],
        };

        let cursor = await db.games.find({});

        if (filter) {
          if (filter === GameType.SLOTMACHINES) {
            cursor = cursor.filter({ type: 'SLOTMACHINES' });
          }

          if (filter === GameType.VIDEOSLOT) {
            cursor = cursor.filter({ type: 'VIDEOSLOT' });
          }

          if (filter === GameType.ALL) {
            cursor = cursor.filter({
              type: { $in: ['SLOTMACHINES', 'VIDEOSLOT'] },
            });
          }
        }

        cursor.skip(page > 0 ? (page - 1) * limit : 0);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (e) {
        throw new Error(`Failed to query games ${e}`);
      }
    },
  },
  Game: {
    id: (game: Game): string => {
      return game._id.toString();
    },
  },
};
