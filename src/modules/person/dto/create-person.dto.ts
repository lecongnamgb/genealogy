import { IsEnum, IsNotEmpty } from 'class-validator';
import { Person } from '../person.chema';
import { Gender } from './../../enums/gender.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonDTO {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty({ enum: Gender })
  gender: Gender;

  @IsNotEmpty()
  @ApiProperty()
  birthDate: string;

  @IsNotEmpty()
  @ApiProperty()
  isDeceased: boolean;

  @ApiProperty()
  deceasedDate: Date | null;

  @ApiProperty()
  siblings: Array<string>;

  @ApiProperty()
  children: Array<string>;

  @ApiProperty()
  spouse: string;

  @ApiProperty()
  father: string;

  @ApiProperty()
  mother: string;
}
