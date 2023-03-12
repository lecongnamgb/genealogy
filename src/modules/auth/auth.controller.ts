import { CreateUserDTO } from './../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Body, Controller, Post, Req, Request } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: CreateUserDTO })
  @Post('/sign-up')
  async signUp(@Body() createUserDTO: CreateUserDTO) {
    return await this.authService.signUp(createUserDTO);
  }

  @Post('/log-in')
  async logIn(@Body() createUserDTO: CreateUserDTO) {
    return await this.authService.logIn(createUserDTO);
  }

  @Post('/refresh-token')
  async refreshToken(@Req() req: Request) {
    return await this.authService.refreshToken(req);
  }
}
