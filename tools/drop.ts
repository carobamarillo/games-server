// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { connectDatabase } from '../src/database';

const drop = async () => {
  try {
    console.log('running drop');
    const db = await connectDatabase();

    const games = await db.games.find({}).toArray()
    const wishlist = await db.wishlist.find({}).toArray();
    const users = await db.users.find({}).toArray();

    /**
     * Only drop db
     * if length > 0
     */
    if (!!games.length) await db.games.drop()
    if (!!wishlist.length) await db.wishlist.drop();
    if (!!users.length) await db.users.drop();

    console.log('drop finished');
  } catch (error) {
    throw new Error('Failed to drop database');
  }
};

drop();
