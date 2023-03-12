import { User } from './../user/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type RefreshTokenSchema = HydratedDocument<RefreshToken>;

@Schema()
export class RefreshToken {
  @ApiProperty()
  @Prop({ required: true })
  userId: string;

  @ApiProperty()
  @Prop({ required: true })
  refreshToken: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
