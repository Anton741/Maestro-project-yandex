import AutherizationError from '../errors/autherization-err';
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload }  from 'jsonwebtoken';

export interface SessionRequest extends Request {
  user?: string | (JwtPayload & {_id: string});
}

export const auth = (req:SessionRequest,res:Response, next: NextFunction) => {
  const {authorization} = req.headers;
  if(!authorization || !authorization.startsWith('Bearer ')){
    return next(new AutherizationError());
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload  = jwt.verify(token, 'secret-key');
  } catch (err) {
    next(new AutherizationError());
  }
  req.user = payload;
  next(); 
}