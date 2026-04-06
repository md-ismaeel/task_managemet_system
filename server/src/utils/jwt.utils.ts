import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const ACCESS_SECRET = (): string => process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_SECRET = (): string => process.env.REFRESH_TOKEN_SECRET as string;

export const generateAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, ACCESS_SECRET(), {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, REFRESH_SECRET(), {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_SECRET()) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_SECRET()) as JwtPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const days = parseInt((process.env.REFRESH_TOKEN_EXPIRY || '7d').replace('d', '')) || 7;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};
