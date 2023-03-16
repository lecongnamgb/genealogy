import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type PersonSchema = HydratedDocument<Person>;

enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

@Schema()
export class Person {
  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty({ enum: ['male', 'female', 'other'] })
  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @ApiProperty()
  @Prop({ required: true })
  birthDate: Date;

  @ApiProperty()
  @Prop({ required: true })
  isDeceased: boolean;

  @ApiProperty()
  @Prop({ required: false })
  deceasedDate: Date | null;

  @ApiProperty()
  @Prop([{ required: false, type: SchemaTypes.ObjectId, ref: 'Person' }])
  children: Array<Person>;

  @ApiProperty()
  @Prop({ required: false, type: SchemaTypes.ObjectId, ref: 'Person' })
  spouse: Person;

  @ApiProperty()
  @Prop({ required: false, type: SchemaTypes.ObjectId, ref: 'Person' })
  father: Person;

  @ApiProperty()
  @Prop({ required: false, type: SchemaTypes.ObjectId, ref: 'Person' })
  mother: Person;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
PersonSchema.pre(/^find/, function (next) {
  this.populate(['children']);
  next();
});
