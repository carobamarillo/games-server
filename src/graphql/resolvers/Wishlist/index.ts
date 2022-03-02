import { IResolvers } from '@graphql-tools/utils';
import { Database, Wishlist } from '../../../types';

export const wishlistResolvers: IResolvers = {
  Wishlist: {
    id: (wishlist: Wishlist): string => {
      return wishlist._id.toString();
    },
    game: (
      wishlist: Wishlist,
      _args: Record<string, unknown>,
      { db }: { db: Database },
    ) => {
      return db.wishlist.findOne({ _id: wishlist.game.id });
    },
  },
};
