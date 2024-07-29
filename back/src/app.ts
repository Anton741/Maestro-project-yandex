import express from 'express';
import mongoose, { Error } from 'mongoose';
import usersRoutes from './routes/users';
import cardsRoutes from './routes/cards';

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createUser, login } from './controllers/users';
import { auth } from './middlewares/auth';
import logger from './middlewares/logger'
import { celebrate, Joi } from 'celebrate';



const app = express(); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000; 

// Сообщение о том, что сервер запущен и прослушивает указанный порт 
mongoose.connect('mongodb://localhost:27017/mynewdb');
app.use(logger.requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().alphanum(),
    password: Joi.string().alphanum(),
  }),
}), login);
app.post('/signup', createUser);

app.use(auth); 
app.use('/users', usersRoutes);
app.use('/cards', cardsRoutes); 

app.use(logger.errorLogger);


app.use((err: Error & {statusCode?: number}, req: Request, res:Response, next: NextFunction) => {
  const { statusCode = 500, message } = err;
  if(err instanceof Error.ValidationError){
    res.status(422).send(err.errors);
  }
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка!'
        : message
    });
}); 




app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => console.log(`Listening on port ${port}`));
