import { Request, Response, NextFunction } from 'express';
import Card from '../models/card';
import NotFoundError from '../errors/not-found-err';
import UncorrectDataError from '../errors/uncorrect-data-err';
import AutherizationError from '../errors/autherization-err';
import ForbiddenError from '../errors/forbidden-err'

export const getCards = (req:Request,res:Response, next: NextFunction) => {
  const {user} = req;
  if(!user){
    next(new AutherizationError())
  }
  return Card.find({})
      .populate(['owner', 'likes'])
      .then(cards => res.send({ data: cards }))
      .catch(next)
}

export const getCardById = (req:Request,res:Response, next: NextFunction) => {
  const {user} = req;
  if(!user){
    next(new AutherizationError())
  }
  return Card.findById(req.params.cardId)
      .populate(['owner', 'likes'])
      .then(card => {
        if(card){
          return res.send({ data: card })
        }
        return Promise.reject(new NotFoundError("Передан некорректный id"));
      })
      .catch((err) => next(err))
};

export const createCard = (req:Request,res:Response, next: NextFunction) => {
  const {name, link} = req.body;
  const {user} = req;
  if(!user){
    next(new AutherizationError())
  }
  return Card.create({name, link, owner: user._id })
      .then(card => res.send({ data: card }))
      .catch(() => next(new UncorrectDataError('Переданы некорректные данные')))
}

export const deleteCard = (req:Request,res:Response, next: NextFunction) => {
  const {user} = req;
  if(!user){
    next(new AutherizationError())
  }
  return Card.findByIdAndDelete({_id: req.params.cardId})
      .populate('owner')
      .then(card => {
        if(!card){
          return Promise.reject(new UncorrectDataError('Передан некорректный id'))
        }
        if(card.owner._id !== user._id){
          return Promise.reject(new ForbiddenError('Доступ к запрошенному ресурсу запрещен'))
        }
        return res.send({ data: card });
      })
      .catch(err => next(err));
}

export const likeCard = (req:Request,res:Response, next: NextFunction) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
.then(card => {
  if(!card){
    return Promise.reject(new UncorrectDataError('Передан некорректный id'))
  }
  return res.send({ data: card });
})
.catch(err => next(err));

export const dislikeCard = (req:Request,res:Response,next: NextFunction) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
.then(card => {
  if(!card){
    return Promise.reject(new UncorrectDataError('Передан некорректный id'))
  }
  return res.send({ data: card });
})
.catch(err => next(err));
