import { PERSON } from './../../const';
import { PersonSchema } from './person.chema';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PERSON, schema: PersonSchema }]),
  ],
  controllers: [PersonController],
  providers: [PersonService],
})
export class PersonModule {}
