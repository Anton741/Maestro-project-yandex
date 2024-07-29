
import { celebrate, Joi } from 'celebrate';
import { getCardById, getCards, deleteCard, createCard, likeCard, dislikeCard } from '../controllers/cards';
import { Router,  } from 'express';

const router = Router();

router.get('/', getCards);
router.get('/:cardId',celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
  headers: Joi.object().keys({
    authorization: Joi.string().alphanum(),
  }),
}), getCardById);

router.post('/', createCard);
router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
  headers: Joi.object().keys({
    authorization: Joi.string().alphanum(),
  }),
}),likeCard);
router.delete('/:cardId/likes',celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
  headers: Joi.object().keys({
    authorization: Joi.string().alphanum(),
  }),
}), dislikeCard);
router.delete('/', deleteCard);


export default router;