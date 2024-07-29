export default class AutherizationError extends Error {
  constructor() {
    super('Ошибка авторизации: Неправильные логин или пароль.');
    this.statusCode = 401;
  }
}
