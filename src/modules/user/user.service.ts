import { CreateUserDTO } from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: string) {
    return await this.userModel.findOne({ _id: id });
  }

  async findByUsername(username: string) {
    return await this.userModel.findOne({ username });
  }

  async createUser(username: string, password: string) {
    return await this.userModel.create({ username, password });
  }
}
