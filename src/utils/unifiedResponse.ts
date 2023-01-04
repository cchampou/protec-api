import { Response } from 'express';
import ERRORS from '../constants/errors';

type UnifiedResponseOptions<T> = {
  message?: string;
  status?: number;
  payload?: T;
};

export type UnifiedResponse = Response;

export const unifiedResponse = <T>(
  res: Response,
  options: UnifiedResponseOptions<T>,
): UnifiedResponse =>
  res.status(options.status || 200).send({
    message: options.message || 'OK',
    payload: options.payload,
  });

export const defaultNotFoundResponse = (res: Response) =>
  unifiedResponse(res, {
    status: 404,
    message: ERRORS.ITEM_NOT_FOUND,
  });

export const defaultInvalidRequestResponse = (res: Response) =>
  unifiedResponse(res, {
    status: 400,
    message: ERRORS.INVALID_REQUEST,
  });
