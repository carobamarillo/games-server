import { MongoClient } from 'mongodb';
import { Database, Game, User, Wishlist } from '../types';

const url = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url);

  const db = client.db('main');

  return {
    games: db.collection<Game>('games'),
    users: db.collection<User>('users'),
    wishlist: db.collection<Wishlist>('wishlist'),
  };
};
