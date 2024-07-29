
import { celebrate, Joi } from 'celebrate';
import {  getUserById, getUsers, updateUser, updateAvatar, getUserInfo } from '../controllers/users';
import { Router,  } from 'express';

const router = Router();

router.get('/', getUsers);
router.get('/me', getUserInfo)
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
  headers: Joi.object().keys({
    authorization: Joi.string().alphanum(),
  }),
}), getUserById);


router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);


export default router;