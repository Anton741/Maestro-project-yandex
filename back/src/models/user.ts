import mongoose, { Model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import AutherizationError from '../errors/autherization-err'

export interface IUser{
  email: string;
  password: string;
  name?: string;
  about?: string;
  avatar?: string;
};

interface IUserMethods {
  findUserByCredentials: (email: string, password: string) => Promise<Document<unknown, any, IUser>>
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: "Жак-Ив Кусто"
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 200,
    default: "Исследователь"
  },
  avatar: {
    type: String,
    default: "https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png",
    validate: {
      validator: function(v) {
        return /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/.test(v);
      }, 
      message: props => `${props.value} is not a valid phone number!`
    },
  }
},  {
  versionKey: false
});

userSchema.statics.findUserByCredentials =  async function findUserByCredentials(email,password){
  const user = await this.findOne({email}).select('+password').orFail(new AutherizationError());
    const matched = await bcrypt.compare(password, user.password);
    if(!matched){
      throw new AutherizationError();
    }
    return user;
}

export default mongoose.model('user', userSchema);
// напишите код здесь