import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FileInjector } from 'nestjs-file-upload';
import { JwtGuard } from '../../guards/jwt/jwt.guard';
import { JwtService } from '../../guards/jwt/jwt.service';
import { LoginDto } from '../../dto/auth/auth.dto';
import { Token } from '../../decorators/token.decorator';
import { PasienDto } from 'src/dto/auth/pasien.dto';
import { PasienBody } from 'src/decorators/auth/pasien.decorator';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @FileInjector(PasienDto)
  @PasienBody()
  @ApiConsumes('multipart/form-data')
  async register(@Body() Pasien: PasienDto) {
    try {
      const res = await this.authService.register(Pasien);
      return {
        status: true,
        message: 'Berhasil Register',
        data: res,
      };
    } catch (err) {
      if (err.status) throw new HttpException(err, err.status);
      else throw new InternalServerErrorException(err);
    }
  }

  @Post('login')
  @FileInjector(PasienDto)
  @PasienBody()
  @ApiConsumes('multipart/form-data')
  async login(@Body() LoginDto: LoginDto) {
    try {
      const pasien = await this.authService.login(LoginDto);
      const token = await this.jwtService.create({ uid: pasien.id });
      const message = 'Login berhasil';
      return { message, token };
    } catch (err) {
      if (err.status) throw new HttpException(err, err.status);
      else throw new InternalServerErrorException(err);
    }
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@Token('uid') uid: string) {
    try {
      const pasien = await this.authService.getPasien(uid);
      return pasien;
    } catch (err) {
      if (err.status) throw new HttpException(err, err.status);
      else throw new InternalServerErrorException(err);
    }
  }
}
