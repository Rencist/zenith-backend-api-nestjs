import {
  Controller,
  Post,
  Body,
  Get,
  InternalServerErrorException,
  HttpException,
  UseGuards,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInjector } from 'nestjs-file-upload';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CheckInService } from './check_in.service';
import { CheckInBody } from 'src/decorators/check_in/check_in.decorator';
import { CheckInDto } from 'src/dto/check_in/check_in.dto';
import { Token } from 'src/decorators/token.decorator';

@ApiTags('check_in')
@Controller('check_in')
export class CheckInController {
  constructor(
    private readonly checkInService: CheckInService,
  ) {}

  @Post('create')
  @UseGuards(JwtGuard)
  @FileInjector(CheckInDto)
  @CheckInBody()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('name'))
  async create(@Token('uid') uid: string, @Body() data: CheckInDto) {
    try {
      const res = await this.checkInService.register(data, uid);
      return {
        status: true,
        message: 'Berhasil Menambahkan Check In',
        data: res,
      };
    } catch (err) {
      if (err.status) throw new HttpException(err, err.status);
      else throw new InternalServerErrorException(err);
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('')
  async getAllCheckIn() {
    try {
      const checkIn = await this.checkInService.getAllCheckIn();
      return {
        status: true,
        message: 'Berhasil Mengambil Data Semua Check In',
        data: checkIn,
      };
    } catch (err) {
      if (err.status) throw new HttpException(err, err.status);
      else throw new InternalServerErrorException(err);
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.PASIEN)
  @Get('/me')
  async getMeCheckIn(@Token('uid') pasien_id: string) {
    try {
      const checkIn = await this.checkInService.getMeCheckIn(pasien_id);
      return {
        status: true,
        message: 'Berhasil Mengambil Data Check In',
        data: checkIn,
      };
    } catch (err) {
      if (err.status) throw new HttpException(err, err.status);
      else throw new InternalServerErrorException(err);
    }
  }
}
