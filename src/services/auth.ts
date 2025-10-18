import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Verifies token and returns decoded payload or throws an Error
export function verifyTokenOrThrow(req: Request) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) throw new Error('Authorization header missing');

  const token = authorizationHeader.split(' ')[1];
  if (!token) throw new Error('Token missing');

  return jwt.verify(token as string, process.env.TOKEN_SECRET as string);
}


export function authorize(req: Request, res: Response) {
  try {
    verifyTokenOrThrow(req);
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}