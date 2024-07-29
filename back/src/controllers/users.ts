import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user';
import NotFoundError from '../errors/not-found-err';
import UncorrectDataError from '../errors/uncorrect-data-err';
import ExistedError from '../errors/existed-err'
import { Error } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AutherizationError from '../errors/autherization-err';
import { SessionRequest } from 'middlewares/auth';

export const getUsers = (req:SessionRequest,res:Response, next: NextFunction) => {
  const {user} = req;
  if(!user){
    next(new AutherizationError())
  }
  return User.find({})
      .then(users => res.send({ data: users }))
      .catch(next)
}

export const getUserById = (req:SessionRequest,res:Response, next: NextFunction) => {
  const {user} = req;
  if(!user){
    next(new AutherizationError())
  }
  return User.findById(req.params.userId)
      .then(user => {
        if(user){
          return res.send({ data: user })
        }
        return Promise.reject(new NotFoundError("Запрашиваемый пользователь не найден"));
      })
      .catch((err) => next(err))
};

export const createUser = (req:Request,res:Response, next: NextFunction) => {
  const {name, about, avatar, email, password} = req.body;
  return bcrypt.hash(password, 10)
      .then((hash:string) => {
        console.log(hash, 'hash')
        return User.create({name, about, avatar, email, password: hash})
      })
      .then((user:IUser) => res.send({ data: user }))
      .catch((err) => {
        if(err.code === 11000){
          next(new ExistedError('Пользователь с таким email уже существует'))
        }
        if(err instanceof Error.ValidationError){
          next(err);
        }
        next(new UncorrectDataError('Переданы некорректные данные'))
      })
}

export const updateUser = (req:SessionRequest,res:Response, next: NextFunction) => {
  console.log('updateUser');
  const {user}:JwtPayload  = req;
  if(!user){
    return next(new AutherizationError())
  }
  const {name, about } = req.body;

  return User.findByIdAndUpdate(user?._id, {name, about}, {new: true})
      .then(user => {
        console.log(user, 'user')
        if(!user){
          return Promise.reject(new NotFoundError('Пользователь с указанным _id не найден'))
        }
        return res.send({ data: user })
      })
      .catch((err) => {
        if(err instanceof Error.ValidationError){
          console.log(err, 'Cast errr')
        }
        next(new UncorrectDataError('Переданы некорректные данные'))
      })
}

export const updateAvatar = (req:SessionRequest,res:Response, next: NextFunction) => {
  const {user}:JwtPayload  = req;
  if(!user){
    return next(new AutherizationError())
  }
  const {avatar} = req.body;

  return User.findByIdAndUpdate(user?._id, {avatar}, {new: true})
      .then(user => res.send({ data: user }))
      .catch(() => next(new UncorrectDataError('Переданы некорректные данные')))
}

export const login = async (req:Request,res:Response, next: NextFunction) => {
  const {email, password} = req.body;
  try {
    const user = await User.findUserByCredentials(email, password);
    res.send({
      token: jwt.sign({_id: user._id}, 'secret-key', {expiresIn: '1w'})
    })
  } catch (error) {
    next(error);
  }
} 

export const getUserInfo = async (req:SessionRequest,res:Response, next: NextFunction) => {
  console.log(req,'getUserInfo');
  const {user}:JwtPayload = req;
  if(!user){
    return next(new AutherizationError());
  }
  const userInfo = await User.findById(user?._id);

  return res.send({ data: userInfo })
}