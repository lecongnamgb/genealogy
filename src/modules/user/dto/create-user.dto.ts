import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDTO {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}
