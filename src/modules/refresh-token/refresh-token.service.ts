import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { RefreshToken } from './refresh-token.schema';
import { Model } from 'mongoose';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async findByUserId(userId: string) {
    return await this.refreshTokenModel.findOne({ userId });
  }

  async createOrUpdate(RefreshTokenDTO: RefreshTokenDTO) {
    let token;
    token = await this.findByUserId(RefreshTokenDTO.userId);
    if (!token) {
      token = await this.refreshTokenModel.create(RefreshTokenDTO);
    }
    return token;
  }
}
