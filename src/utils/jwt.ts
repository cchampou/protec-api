import { JwtPayload, sign, verify } from 'jsonwebtoken';

export const generateJWT = (userId: string) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  return sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '10m',
  });
};

export const verifyToken = (token: string): string | JwtPayload => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  return verify(token, process.env.JWT_SECRET);
};
