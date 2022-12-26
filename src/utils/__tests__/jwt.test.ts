import { generateJWT, verifyToken } from '../jwt';
import { sign } from 'jsonwebtoken';
import { expect } from '@jest/globals';

describe('JWT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = sign({ id: '1' }, 'secret');
      const result = verifyToken(token);
      expect(result).toStrictEqual({ id: '1', iat: expect.any(Number) });
    });

    it('should throw an error if secret is not defined', () => {
      delete process.env.JWT_SECRET;
      expect(() => verifyToken('token')).toThrowError(
        'JWT_SECRET is not defined',
      );
    });

    it('should throw an error if the secret is invalid', () => {
      const token = sign({ id: '1' }, 'invalid');
      expect(() => verifyToken(token)).toThrow();
    });

    it('should throw an error if the token is invalid', () => {
      expect(() => verifyToken('invalid')).toThrow();
    });
  });

  describe('generateJWT', () => {
    it('should generate a token', () => {
      const token = generateJWT('1');
      expect(token).not.toBeUndefined();
    });

    it('should throw an error if the secret is not defined', () => {
      delete process.env.JWT_SECRET;
      expect(() => {
        generateJWT('1');
      }).toThrow('JWT_SECRET is not defined');
    });
  });
});
