import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // logger.debug('Checking if user is authenticated');
  const authorization = req.header('Authorization');
  if (authorization) {
    const token = authorization.split(' ')[1];
    if (token && process.env.JWT_SECRET) {
      // logger.debug('Token found, verifying');
      try {
        const result = await verify(token, process.env.JWT_SECRET);
        // logger.debug('Token verified');
        if (result) {
          // logger.debug('Token verified');
          return next();
        }
      } catch (error) {
        // logger.debug('Token not verified');
        return res.status(401).send({ message: 'Invalid token' });
      }
    }
  }
  // logger.debug('Token not found');
  return res.status(401).send({ message: 'Token not found' });
};

export default isAuthenticated;
