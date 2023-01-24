import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckInDto } from 'src/dto/check_in/check_in.dto';
import { Prisma } from '@prisma/client';
import { resolve } from 'path';
import { rejects } from 'assert';

@Injectable()
export class CheckInService {
  constructor(
    private prisma: PrismaService
    ) {}

  async register(data: CheckInDto, uid: string) {
    // const checkCheckIn = await this.prisma.check_In.findUnique({
    //   where: {
    //     penyakit: data.penyakit,
    //   },
    // });

    // if (checkCheckIn) {
    //   throw new BadRequestException('Check In Sudah Terdaftar');
    // }
    const newdata: Prisma.Check_InUncheckedCreateInput = {
      penyakit: data.penyakit,
      pasien_id: uid,
    };

    // const success = new Promise((resolve, reject) => {
        const checkIn = await this.prisma.check_In.create({
          data: newdata
        });
        // if (!checkIn) reject();
        data.gejala.forEach(async datum => {
          const gejalaId = await this.prisma.gejala.findFirst({
            where: {
              name: datum.name,
            },
          })
          if(gejalaId) {
            const newdata: Prisma.Check_In_GejalaUncheckedCreateInput = {
              gejala_id: gejalaId.id,
              check_in_id: (await checkIn).id,
            };
            await this.prisma.check_In_Gejala.create({
              data: newdata
            })
          }
        }) 
  //       resolve(success);
  // })
    return checkIn;
  }

  async getAllCheckIn() {
    const checkIn = await this.prisma.check_In.findMany({});

    if (!checkIn) throw new BadRequestException('Check In not found');
    return checkIn;
  }

  async getMeCheckIn(pasien_id: string) {
    const checkIn = await this.prisma.check_In.findMany({
      where: {
        pasien_id: pasien_id
      }
    });

    if (!checkIn) throw new BadRequestException('Check In not found');
    return checkIn;
  }

  async getDetailCheckIn(check_in_id: string) {
    const checkIn = await this.prisma.check_In.findFirst({
      where: {
        id: check_in_id
      }
    });
    const checkInGejala = await this.prisma.check_In_Gejala.findMany({
      where: {
        check_in_id: check_in_id
      }
    })
    const prom = new Promise((resolve, reject) => {
      const result = {
        penyakit: checkIn.penyakit,
        gejala: [],
        date: new Date(checkIn.createdAt).toLocaleDateString('en-US', {
          timeZone: 'Asia/Jakarta'
      })
      };
      let i = 0;
      checkInGejala.forEach(async (datum) => {
        const result2 = await this.prisma.gejala.findFirst({
          where:{
            id: datum.gejala_id
          }
        });
        if (await result2) {
          result.gejala.push(result2.name);
          i++;
          if(i == checkInGejala.length) resolve(result);
        }
        
      });
    });
    return await prom;
  }
}
