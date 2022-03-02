import merge from 'lodash.merge';
import { gameResolvers } from './Game';
import { wishlistResolvers } from './Wishlist';
import { viewerResolvers } from './Viewer';
import { userResolvers } from './User';

export const resolvers = merge(
  viewerResolvers,
  userResolvers,
  gameResolvers,
  wishlistResolvers,
);
