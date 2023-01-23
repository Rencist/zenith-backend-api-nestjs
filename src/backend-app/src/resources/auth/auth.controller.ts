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
import { UserDto } from '../../dto/auth/user.dto';
import { Token } from '../../decorators/token.decorator';
import { UserBody } from 'src/decorators/auth/User.decorator';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @FileInjector(UserDto)
  @UserBody()
  @ApiConsumes('multipart/form-data')
  async register(@Body() User: UserDto) {
    try {
      const res = await this.authService.register(User);
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
  @FileInjector(UserDto)
  @UserBody()
  @ApiConsumes('multipart/form-data')
  async login(@Body() LoginDto: LoginDto) {
    try {
      const user = await this.authService.login(LoginDto);
      const token = await this.jwtService.create({ uid: user.id });
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
      const user = await this.authService.getUser(uid);
      return user;
    } catch (err) {
      if (err.status) throw new HttpException(err, err.status);
      else throw new InternalServerErrorException(err);
    }
  }
}
