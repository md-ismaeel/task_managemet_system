import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface TaskQuery {
  page?: string;
  limit?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  search?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
