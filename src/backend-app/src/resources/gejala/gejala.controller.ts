import {
  Controller,
  Post,
  Body,
  Get,
  InternalServerErrorException,
  HttpException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GejalaService } from './gejala.service';
import { FileInjector } from 'nestjs-file-upload';
import { GejalaDto } from 'src/dto/gejala/gejala.dto';
import { GejalaBody } from 'src/decorators/gejala/gejala.decorator';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('gejala')
@Controller('gejala')
export class GejalaController {
  constructor(
    private readonly gejalaService: GejalaService,
  ) {}

  @Post('create')
  @FileInjector(GejalaDto)
  @GejalaBody()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('name'))
  async create(@Body() data: GejalaDto) {
    try {
      const res = await this.gejalaService.register(data);
      return {
        status: true,
        message: 'Berhasil Menambahkan Gejala',
        data: res,
      };
    } catch (err) {
      if (err.status) throw new HttpException(err, err.status);
      else throw new InternalServerErrorException(err);
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.PASIEN)
  @Get('')
  async getAllGejala() {
    try {
      const gejala = await this.gejalaService.getAllGejala();
      return {
        status: true,
        message: 'Berhasil Mengambil Data Semua Gejala',
        data: gejala,
      };
    } catch (err) {
      if (err.status) throw new HttpException(err, err.status);
      else throw new InternalServerErrorException(err);
    }
  }
}
