import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'UNSPLASH_ERROR'
  | 'UNAUTHORIZED'
  | 'UNKNOWN_ERROR';

export function apiError(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}
