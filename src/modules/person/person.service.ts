import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePersonDTO } from './dto/create-person.dto';
import { UpdatePersonDTO } from './dto/update-person.dto';
import { Person, PersonSchema } from './person.chema';

@Injectable()
export class PersonService {
  constructor(
    @InjectModel(Person.name) private personModel: Model<PersonSchema>,
  ) {}

  async getAllPerson(): Promise<any> {
    try {
      const products = await this.personModel.find();
      return {
        success: true,
        data: products,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getPersonById(id: string): Promise<any> {
    try {
      const product = await this.personModel.findById(id);
      return {
        success: true,
        data: product,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async createPerson(createPersonDTO: CreatePersonDTO) {
    try {
      const product = await this.personModel.create(createPersonDTO);
      return {
        success: true,
        data: product,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updatePerson(id: string, updatePersonDTO: UpdatePersonDTO) {
    try {
      const doesExist = await this.personModel.findById({ _id: id });
      if (!doesExist) {
        throw new BadRequestException('Invalid id');
      }
      const product = await this.personModel
        .updateOne({ _id: id }, updatePersonDTO)
        .exec();
      return {
        success: true,
        data: product,
      };
    } catch (err) {
      return {
        success: false,
        message: err,
      };
    }
  }

  async deletePersonById(id: string) {
    try {
      await this.personModel.deleteOne({ _id: id });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err,
      };
    }
  }
}
