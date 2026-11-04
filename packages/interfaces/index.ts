// Base type definitions for the project

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

export interface SuccessResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type RecordOf<T> = Record<string, T>;

export interface Design {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  nodesCount: number;
  connectionsCount: number;
  data: {
    cards: any[];
    connections: any[];
  };
}

export {
  CreatePersonRequest,
  ErrorResponse as PeopleErrorResponse,
  PersonResponse,
  UpdatePersonRequest,
  ValidationIssue,
} from "./people";
