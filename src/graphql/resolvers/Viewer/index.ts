import crypto from 'crypto';
import { Request, Response } from 'express';
import { IResolvers } from '@graphql-tools/utils';
import { Google } from '../../../api';
import { Viewer, Database, User } from '../../../types';
import { LogInArgs } from './types';

const cookieOptions = {
  httpOnly: true,
  sameSite: true,
  signed: true,
  secure: process.env.NODE_ENV !== 'development' ? true : false,
};

const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database,
  res: Response,
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) throw new Error(`Google logIn error`);

  /**
   * User name
   */
  const userName = user?.names?.[0]?.displayName || null;
  /**
   * User id
   */
  const userId = user?.names?.[0]?.metadata?.source?.id || null;
  /**
   * User avatar
   */
  const userAvatar = user?.photos?.[0]?.url || null;

  /**
   * User email
   */
  const userEmail = user?.emailAddresses?.[0]?.value || null;

  if (!userId || !userName || !userAvatar || !userEmail)
    throw new Error(`Google logIn error`);

  const update = await db.users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        name: userName,
        avatar: userAvatar,
        contact: userEmail,
        token,
      },
    },
    { returnDocument: 'after' },
  );

  let viewer = update.value;

  if (!viewer) {
    const insert = await db.users.insertOne({
      _id: userId,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      token,
      income: 0,
      wishlist: [],
      games: [],
    });

    viewer = await db.users.findOne({ _id: insert.insertedId });
  }

  res.cookie('viewer', userId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });

  return viewer || undefined;
};

const logInViaCookie = async (
  token: string,
  db: Database,
  req: Request,
  res: Response,
): Promise<User | undefined> => {
  const update = await db.users.findOneAndUpdate(
    {
      _id: req.signedCookies.viewer,
    },
    { $set: { token } },
    { returnDocument: 'after' },
  );

  const viewer = update.value;

  if (!viewer) res.clearCookie('viewer', cookieOptions);

  return viewer || undefined;
};

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (e) {
        throw new Error(`Failed to query Google auth url: ${e}`);
      }
    },
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db, req, res }: { db: Database; req: Request; res: Response },
    ): Promise<Viewer> => {
      try {
        const code = input ? input.code : null;
        const token = crypto.randomBytes(16).toString('hex');

        const viewer: User | undefined = code
          ? await logInViaGoogle(code, token, db, res)
          : await logInViaCookie(token, db, req, res);

        if (!viewer) return { didRequest: true };

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (e) {
        throw new Error(`Failed to logIn: ${e}`);
      }
    },
    logOut: (
      _root: undefined,
      _args: Record<string, never>,
      { res }: { res: Response },
    ): Viewer => {
      try {
        res.clearCookie('viewer', cookieOptions);
        return { didRequest: true };
      } catch (e) {
        throw new Error(`Failed to logOut: ${e}`);
      }
    },
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => viewer._id,
    hasWallet: (viewer: Viewer): boolean | undefined =>
      viewer.walletId ? true : undefined,
  },
};
