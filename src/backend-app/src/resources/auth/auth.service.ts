import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../../dto/auth/auth.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { Login_Attempt, Prisma, Pasien } from '@prisma/client';
import { uploadFiles } from 'src/dto/auth/uploadFiles.dto';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as path from 'path';
import { PasienDto } from 'src/dto/auth/pasien.dto';
import { PasienUpdateDto } from 'src/dto/auth/pasien_update.dto';

const SALT_PASSWORD = 12;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(LoginDto: LoginDto) {
    const pasien = await this.prisma.pasien.findUnique({
      where: {
        no_telp: LoginDto.no_telp,
      },
      include: {
        loginAttempt: true,
      },
    });

    if (!pasien)
      throw new UnauthorizedException('No Telp / Password not valid');

    //cek login attempt
    const _cekAttempt = await this.cekAttempt(pasien);
    if (!_cekAttempt.status)
      throw new HttpException(
        `Terlalu banyak mencoba. Tunggu ${_cekAttempt.second} detik untuk mencoba kembali.`,
        429,
      );

    // compare passwords
    const areEqual = await compare(LoginDto.password, pasien.password);
    if (!areEqual)
      throw new UnauthorizedException('No Telp / Passoword not valid');

    // reset login attempt
    await this.prisma.login_Attempt.update({
      where: {
        pasienId: pasien.id,
      },
      data: {
        countAttempt: 0,
        limitTime: null,
      },
    });

    delete pasien.password;
    return pasien;
  }

  async register(Pasien: PasienDto) {
    const checkPasien = await this.prisma.pasien.findUnique({
      where: {
        no_telp: Pasien.no_telp,
      },
    });

    if (checkPasien) {
      throw new BadRequestException('No Telp sudah terdaftar');
    }
    const uploadFoto: uploadFiles = {
      fileIs: Pasien.foto,
      no_telp: Pasien.no_telp,
      path: 'src/uploads/pasien',
      res: 'foto',
    };
    await this.uploadFile(uploadFoto);

    const newdata: Prisma.PasienUncheckedCreateInput = {
      fullname: Pasien.fullname,
      no_telp: Pasien.no_telp,
      alamat: Pasien.alamat,
      password: Pasien.password,
      foto:
        '/pasien/foto/' +
        uploadFoto.no_telp +
        '-' +
        uploadFoto.res +
        '.jpeg',
    };
    const success = new Promise((resolve, reject) => {
      hash(Pasien.password, SALT_PASSWORD, async (err, hash) => {
        newdata.password = hash;

        const pasien = await this.prisma.pasien.create({
          data: newdata,
        });
        if (!pasien) reject();
        resolve(pasien);
      });
    });
    return success;
  }

  async updatePasien(pasien_id: string, data: PasienUpdateDto) {
    const cekUser = await this.prisma.pasien.findFirst({
      where: {
        id: pasien_id,
      },
    });
    if (!cekUser) {
      throw new BadRequestException('Forda Order tidak ditemukan');
    }
    const forda_member = await this.prisma.pasien.findFirst({
      where: {
        id: pasien_id,
      }
    });
    const uploadFoto: uploadFiles = {
      fileIs: data.foto,
      no_telp: forda_member.no_telp,
      path: 'src/uploads/pasien',
      res: 'foto',
    };
    await this.uploadFile(uploadFoto);

    const newdata: Prisma.PasienUncheckedUpdateInput = {
      fullname: data.fullname,
      no_telp: data.no_telp,
      alamat: data.alamat,
      password: data.password,
      foto:
        '/pasien/foto/' +
        uploadFoto.no_telp +
        '-' +
        uploadFoto.res +
        '.jpeg',
    };

    const result = await this.prisma.pasien.update({
      where: {
        id: pasien_id,
      },
      data: newdata,
    });
    return result;
  }

  async getPasien(id: string) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { id: id },
    });

    if (!pasien) throw new NotFoundException('Pasien not found');
    const dataReturn = {
      status: true,
      message: 'Pasien found',
      data: pasien,
    };
    // if (pasien.role === 'ADMIN') delete dataReturn.data.fordaArea;
    delete dataReturn.data.password;
    return dataReturn;
  }

  async cekAttempt(
    pasien: Pasien & { loginAttempt: Login_Attempt },
  ): Promise<{ status: boolean; second?: number }> {
    let res = true;
    let second = 0;
    if (pasien.loginAttempt) {
      if (pasien.loginAttempt.limitTime) {
        const nowDateTime: number = new Date().getTime() / 1000;
        let sub = nowDateTime - pasien.loginAttempt.limitTime.getTime() / 1000;
        sub = Math.round(sub);
        if (sub < 0) {
          res = false;
          return {
            status: res,
            second: Math.abs(sub),
          };
        }
      }
      if (pasien.loginAttempt.countAttempt >= 3) {
        const date = new Date();
        date.setMinutes(date.getMinutes() + 3);
        await this.prisma.login_Attempt
          .update({
            where: {
              pasienId: pasien.id,
            },
            data: {
              countAttempt: 0,
              limitTime: date,
            },
          })
          .then(() => {
            res = false;
            second = 180;
          });
      } else {
        await this.prisma.login_Attempt.update({
          where: {
            pasienId: pasien.id,
          },
          data: {
            countAttempt: ++pasien.loginAttempt.countAttempt,
          },
        });
      }
    } else {
      await this.prisma.login_Attempt.create({
        data: {
          pasienId: pasien.id,
          countAttempt: 1,
        },
      });
    }

    return {
      status: res,
      second,
    };
  }

  async uploadFile(data: uploadFiles) {
    const getBuffer = data.fileIs.buffer;

    const newfilename =
      data.no_telp + '-' + data.res + '.jpeg';
    const checkDir = fs.existsSync(data.path + '/' + data.res);
    if (!checkDir) {
      fs.mkdirSync(data.path + '/' + data.res, { recursive: true });
    }

    await sharp(getBuffer)
      .jpeg({ quality: 80 })
      .toFile(path.join(data.path + '/' + data.res, newfilename));

    return newfilename;
  }
}
