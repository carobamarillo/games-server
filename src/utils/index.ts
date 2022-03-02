import { Request } from 'express';
import { Database, User } from '../types';

export const auth = async (
  db: Database,
  req: Request,
): Promise<User | null> => {
  /**
   * get token
   * from key
   */
  const token = req.get('X-CSRF-TOKEN');

  const viewer = await db.users.findOne({
    _id: req.signedCookies.viewer,
    token,
  });

  return viewer;
};
