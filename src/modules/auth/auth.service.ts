import { RefreshTokenService } from './../refresh-token/refresh-token.service';
import { CreateUserDTO } from './../user/dto/create-user.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from './../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(createUserDTO: CreateUserDTO) {
    try {
      const doesExist = await this.userService.findByUsername(
        createUserDTO.username,
      );
      if (doesExist) {
        throw new BadRequestException('User already existed');
      }
      const newPassword = await bcrypt.hash(
        createUserDTO.password,
        Number(process.env.SALT_ROUND || 10),
      );
      await this.userService.createUser(createUserDTO.username, newPassword);
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

  async refreshToken(req: Request) {
    try {
      const token = req.headers['x-refresh-token'];
      if (!token) {
        throw new BadRequestException('No refresh token in header');
      }
      const isValidToken = this.jwtService.verify(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        ignoreExpiration: false,
      });

      if (!isValidToken) {
        throw new BadRequestException('Invalid token');
      }
      console.log(process.env.ACCESS_TOKEN_SECRET);
      const accessToken = this.jwtService.sign(
        { username: isValidToken.username, userId: isValidToken.userId },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: process.env.ACCESS_TOKEN_LIFE,
        },
      );

      return { success: true, accessToken };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  }

  async logIn(CreateUserDTO: CreateUserDTO) {
    try {
      const user = await this.userService.findByUsername(
        CreateUserDTO.username,
      );
      if (!user) {
        throw new BadRequestException('Invalid username');
      }
      const isValidPw = await bcrypt.compare(
        CreateUserDTO.password,
        user.password,
      );
      if (!isValidPw) {
        throw new BadRequestException('Invalid password');
      }
      const refreshToken = this.jwtService.sign(
        {
          userId: user._id.toString(),
          username: user.username,
        },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: process.env.REFRESH_TOKEN_LIFE,
        },
      );
      await this.refreshTokenService.createOrUpdate({
        userId: user._id.toString(),
        refreshToken,
      });
      return {
        success: true,
        refreshToken,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  }
}
