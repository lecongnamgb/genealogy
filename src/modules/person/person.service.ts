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
import { GENDER } from 'src/const';

@Injectable()
export class PersonService {
  constructor(
    @InjectModel(Person.name) private personModel: Model<PersonSchema>,
  ) {}

  async getAllPerson(pageNumber = 1, pageSize = 10): Promise<any> {
    try {
      const skip = (Number(pageNumber) - 1) * Number(pageSize);
      const people = await this.personModel.find().skip(skip).limit(pageSize);
      const count = await this.personModel.find().count();
      return {
        success: true,
        data: people,
        total: count,
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getPersonById(id: string): Promise<any> {
    try {
      const person = await this.personModel.findOne({ _id: id });
      if (!person) {
        throw new BadRequestException('Invalid id');
      }
      return {
        success: true,
        data: person,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  }

  async getAncestory(id: string): Promise<String[]> {
    try {
      const person = await this.personModel.findOne({ _id: id });
      const ancestory = [];
      ancestory.push(id);
      if (person.mother) {
        const motherId = Object(person.mother)._id.toString();
        ancestory.push(motherId);
        const motherAncestory = await this.getAncestory(motherId);
        ancestory.push(...motherAncestory);
      }
      if (person.father) {
        const fatherId = Object(person.father)._id.toString();
        ancestory.push(fatherId);
        const fatherAncestory = await this.getAncestory(fatherId);
        ancestory.push(...fatherAncestory);
      }
      return ancestory;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async createPerson(createPersonDTO: CreatePersonDTO) {
    try {
      const { spouse, father, mother, children } = createPersonDTO;
      let fatherInfo;
      let spouseInfo;
      let motherInfo;
      let childrenInfo = false;
      let ancestorArr = [];
      let validParent = true;

      if (Boolean(father)) {
        fatherInfo = await this.personModel.findOne({ _id: father });
        if (!Boolean(fatherInfo) || fatherInfo.gender != GENDER.MALE) {
          throw new BadRequestException('Invalid father info');
        }
        const fatherAncestory = await this.getAncestory(father);
        ancestorArr.push(...fatherAncestory);
      }
      if (Boolean(spouse)) {
        spouseInfo = await this.personModel.findOne({ _id: spouse });
        if (!spouseInfo) {
          throw new BadRequestException('Invalid spouse info');
        }
      }
      if (Boolean(mother)) {
        motherInfo = await this.personModel.findOne({ _id: mother });
        if (!motherInfo || motherInfo.gender != GENDER.FEMALE) {
          throw new BadRequestException('Invalid mother info');
        }
        const motherAncestory = await this.getAncestory(mother);
        ancestorArr.push(...motherAncestory);
      }

      if (children && children.length > 0) {
        for (const child of children) {
          if (ancestorArr.indexOf(child) !== -1) {
            throw new BadRequestException('Child is one of their ancestor');
          }
        }
        childrenInfo = true;
        children.map(async (child) => {
          if (Boolean(child)) {
            const childInfo = await this.personModel.findOne({ _id: child });
            if (!childInfo) {
              // If the child doesn't exist and the ancestory id arr  includes child Id
              throw new BadRequestException('Invalid child info');
            }
          }
        });
      }

      if (Boolean(mother)) {
        motherInfo = await this.personModel.findOne({ _id: mother });
        if (!motherInfo || motherInfo.gender != GENDER.FEMALE) {
          throw new BadRequestException('Invalid mother info');
        }
      }

      const person = await this.personModel.create(createPersonDTO);
      if (fatherInfo) {
        const currentChildren = fatherInfo.children.map((child) => child._id);
        currentChildren.push(person._id.toString());
        await this.personModel.updateOne(
          { _id: father },
          { children: currentChildren },
        );
      }
      if (motherInfo) {
        const currentChildren = motherInfo.children.map((child) => child._id);
        currentChildren.push(person._id.toString());
        await this.personModel.updateOne(
          { _id: mother },
          { children: currentChildren },
        );
      }
      if (spouseInfo) {
        const spouseOfPerson = await this.personModel.findOne({
          _id: spouseInfo._id,
        });
        spouseOfPerson.spouse = person;
        spouseOfPerson.save();
      }
      if (childrenInfo) {
        children.map(async (child) => {
          const childInfo = await this.personModel.findOne({ _id: child });
          if (person.gender == GENDER.MALE) {
            childInfo.mother = person;
          } else {
            childInfo.father = person;
          }
        });
      }

      return {
        success: true,
        data: person,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  }

  async updatePerson(id: string, updatePersonDTO: UpdatePersonDTO) {
    try {
      const doesExist = await this.personModel.findById({ _id: id });
      if (!doesExist) {
        throw new BadRequestException('Invalid id');
      }
      const { children, father, mother, spouse } = updatePersonDTO;
      const ancestoryArr = [];
      if (father) {
        const newFather = await this.personModel.findOne({ _id: father });
        if (!newFather) {
          throw new BadRequestException('Invalid father info');
        }
        const newFatherAncestory = await this.getAncestory(father);
        ancestoryArr.push(...newFatherAncestory);
        const oldFather = await this.personModel.findOne({
          _id: Object(doesExist.father)._id,
        });
        if (oldFather) {
          const children = oldFather.children.map((child) =>
            Object(child)._id?.toString(),
          );
          const index = children.indexOf(doesExist._id.toString());

          if (index > -1) {
            children.splice(index, 1);
          }
          oldFather.children = children;
          oldFather.save();
        }
        newFather.children.push(doesExist);
        newFather.save();
      }

      if (mother) {
        const newMother = await this.personModel.findOne({ _id: mother });
        if (!newMother) {
          throw new BadRequestException('Invalid mother info');
        }
        const newMotherAncestory = await this.getAncestory(mother);
        ancestoryArr.push(...newMotherAncestory);
        const oldMother = await this.personModel.findOne({
          _id: Object(doesExist.mother)._id,
        });
        if (oldMother) {
          const children = oldMother.children.map((child) =>
            Object(child)._id?.toString(),
          );

          const index = children.indexOf(doesExist._id.toString());

          if (index > -1) {
            children.splice(index, 1);
          }
          oldMother.children = children;
          oldMother.save();
        }
        newMother.children.push(doesExist);
        newMother.save();
      }

      if (spouse) {
        const newSpouse = await this.personModel.findOne({ _id: spouse });
        if (!newSpouse) {
          throw new BadRequestException('Invalid spouse info');
        }
        const oldSpouse = await this.personModel.findOne({
          _id: Object(doesExist.spouse)._id,
        });
        if (oldSpouse) {
          const children = oldSpouse.children.map((child) =>
            Object(child)._id?.toString(),
          );

          const index = children.indexOf(doesExist._id.toString());

          if (index > -1) {
            children.splice(index, 1);
          }
          oldSpouse.children = children;
          oldSpouse.save();
        }
        newSpouse.children.push(doesExist);
        newSpouse.save();
      }

      if (children && children.length > 0) {
        children.map(async (child) => {
          const childInstance = await this.personModel.findOne({ _id: child });

          if (!childInstance || ancestoryArr.indexOf(child) !== -1) {
            throw new BadRequestException('Invalid children info');
          }
          /*
          Old mother/father removes children
           */
          if (doesExist.gender == GENDER.FEMALE) {
            const oldMother = await this.personModel.findOne({
              _id: Object(childInstance.mother)._id,
            });
            const children = oldMother.children.map((child) =>
              Object(child)._id?.toString(),
            );

            const index = children.indexOf(child);

            if (index > -1) {
              children.splice(index, 1);
            }
            oldMother.children = children;
            oldMother.save();
            childInstance.mother = doesExist;
            childInstance.save();
          } else {
            const oldFather = await this.personModel.findOne({
              _id: Object(childInstance.father)._id,
            });
            const children = oldFather.children.map((child) =>
              Object(child)._id?.toString(),
            );
            const index = children.indexOf(child);
            if (index > -1) {
              children.splice(index, 1);
            }
            oldFather.children = children;
            oldFather.save();
            childInstance.father = doesExist;
            childInstance.save();
          }
        });
      }

      const person = await this.personModel
        .updateOne({ _id: id }, updatePersonDTO)
        .exec();
      return {
        success: true,
        data: person,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
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
        message: err.message,
      };
    }
  }

  async bulkDelete(txt: string) {
    try {
      await this.personModel.deleteMany({
        name: { $regex: `.*${txt}.*` },
      });
      return {
        success: true,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  }

  async getAllRootPeople() {
    try {
      const allPeople = await this.personModel.find();
      const rootPeopleFlag = {};
      allPeople.map((person) => {
        if (!(person?.mother || person?.father)) {
          const id = person._id.toString();
          rootPeopleFlag[id] = true;
        }
      });
      const convertArrToFlagObj = (arr) => {
        const obj = {};
        arr.map((item) => {
          obj[item] = true;
        });
        return obj;
      };

      const getTree = async (arrFlag) => {
        const tree = [];
        const ids = Object.keys(arrFlag);
        for (let i = 0; i < ids.length; i++) {
          if (arrFlag[ids[i]] == false) {
            continue;
          }
          const person = await this.personModel.findOne({ _id: ids[i] });
          if (person.spouse) {
            const spouse = await this.personModel.findOne({
              _id: Object(person.spouse)._id,
            });
            person.spouse = spouse;
            arrFlag[spouse._id.toString()] = false;
          }
          const childrenIds = person.children.map((child) =>
            Object(child)._id.toString(),
          );
          const childrenArr = convertArrToFlagObj(childrenIds);
          person.children = await getTree(childrenArr);

          tree.push(person);
        }
        return tree;
      };
      const data = await getTree(rootPeopleFlag);
      return {
        success: true,
        data,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  }
}
