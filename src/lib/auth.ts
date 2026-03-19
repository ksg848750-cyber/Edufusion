import { verifyAuthToken } from './firebase-admin';
import { NextRequest } from 'next/server';

export async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) return null;

  const decodedToken = await verifyAuthToken(token);
  return decodedToken;
}
