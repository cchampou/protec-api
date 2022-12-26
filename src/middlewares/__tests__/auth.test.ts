import isAuthenticated from '../auth';
import { Request, Response } from 'express';
import { expect } from '@jest/globals';
import { verifyToken } from '../../utils/jwt';

const next = jest.fn();

const mockedVerifyToken = verifyToken as jest.MockedFunction<
  typeof verifyToken
>;

jest.mock('../../utils/jwt');

describe('isAuthenticated middleware', () => {
  it('should respond with a 401 and the missing header message', async () => {
    const req = {
      header: jest.fn().mockReturnValue(undefined) as any,
    } as Request;
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    await isAuthenticated(req, res, next);
    expect(res.status).toBeCalledWith(401);
    expect(res.send).toBeCalledWith(
      new Error('Authorization header is not defined'),
    );
  });

  it('should respond with a 401 and the missing token message', async () => {
    const req = {
      header: jest.fn().mockReturnValue('Bearer ') as any,
    } as Request;
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    await isAuthenticated(req, res, next);
    expect(res.status).toBeCalledWith(401);
    expect(res.send).toBeCalledWith(new Error('Token is not defined'));
  });

  it('should call next if the token is valid', async () => {
    const req = {
      header: jest.fn().mockReturnValue('Bearer token') as any,
    } as Request;
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    await isAuthenticated(req, res, next);
    expect(next).toBeCalled();
  });

  it('should respond with a 401 and the invalid token message', async () => {
    const req = {
      header: jest.fn().mockReturnValue('Bearer token') as any,
    } as Request;
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    mockedVerifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    await isAuthenticated(req, res, next);
    expect(res.status).toBeCalledWith(401);
    expect(res.send).toBeCalledWith(new Error('Invalid token'));
  });
});
