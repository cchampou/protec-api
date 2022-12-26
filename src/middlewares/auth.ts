import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.header('Authorization');
  try {
    if (!authorization) throw new Error('Authorization header is not defined');
    const token = authorization.split(' ')[1];
    if (!token) throw new Error('Token is not defined');
    verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).send(error);
  }
};

export default isAuthenticated;
