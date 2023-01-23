import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GejalaDto } from 'src/dto/gejala/gejala.dto';

@Injectable()
export class GejalaService {
  constructor(
    private prisma: PrismaService
    ) {}

  async register(data: GejalaDto) {
    const checkGejala = await this.prisma.gejala.findUnique({
      where: {
        name: data.name,
      },
    });

    if (checkGejala) {
      throw new BadRequestException('Gejala Sudah Terdaftar');
    }
    const success = new Promise((resolve, reject) => {
        const gejala = this.prisma.gejala.create({
          data: data,
        });
        if (!gejala) reject();
        resolve(gejala);
    });
    return success;
  }

  async getAllGejala() {
    const gejala = await this.prisma.gejala.findMany({});

    if (!gejala) throw new BadRequestException('Gejala not found');
    return gejala;
  }
}
