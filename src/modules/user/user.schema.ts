import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type UserSchema = HydratedDocument<User>;

@Schema()
export class User {
  @ApiProperty()
  @Prop()
  username: string;

  @ApiProperty()
  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
