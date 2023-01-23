import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../../dto/auth/auth.dto';
import { UserDto } from '../../dto/auth/user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { Login_Attempt, Prisma, User } from '@prisma/client';
import { uploadFiles } from 'src/dto/auth/uploadFiles.dto';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as path from 'path';

const SALT_PASSWORD = 12;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(LoginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        no_telp: LoginDto.no_telp,
      },
      include: {
        loginAttempt: true,
      },
    });

    if (!user)
      throw new UnauthorizedException('No Telp / Password not valid');

    //cek login attempt
    const _cekAttempt = await this.cekAttempt(user);
    if (!_cekAttempt.status)
      throw new HttpException(
        `Terlalu banyak mencoba. Tunggu ${_cekAttempt.second} detik untuk mencoba kembali.`,
        429,
      );

    // compare passwords
    const areEqual = await compare(LoginDto.password, user.password);
    if (!areEqual)
      throw new UnauthorizedException('No Telp / Passoword not valid');

    // reset login attempt
    await this.prisma.login_Attempt.update({
      where: {
        userId: user.id,
      },
      data: {
        countAttempt: 0,
        limitTime: null,
      },
    });

    delete user.password;
    return user;
  }

  async register(User: UserDto) {
    const checkUser = await this.prisma.user.findUnique({
      where: {
        no_telp: User.no_telp,
      },
    });

    if (checkUser) {
      throw new BadRequestException('No Telp sudah terdaftar');
    }
    const uploadFoto: uploadFiles = {
      fileIs: User.foto,
      no_telp: User.no_telp,
      path: 'src/uploads/user',
      res: 'foto',
    };
    await this.uploadFile(uploadFoto);

    const newdata: Prisma.UserUncheckedCreateInput = {
      fullname: User.fullname,
      no_telp: User.no_telp,
      alamat: User.alamat,
      password: User.password,
      foto:
        '/user/foto/' +
        uploadFoto.no_telp +
        '-' +
        uploadFoto.res +
        '.jpeg',
    };
    const success = new Promise((resolve, reject) => {
      hash(User.password, SALT_PASSWORD, async (err, hash) => {
        newdata.password = hash;

        const user = await this.prisma.user.create({
          data: newdata,
        });
        if (!user) reject();
        resolve(user);
      });
    });
    return success;
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) throw new NotFoundException('User not found');
    const dataReturn = {
      status: true,
      message: 'User found',
      data: user,
    };
    // if (user.role === 'ADMIN') delete dataReturn.data.fordaArea;
    delete dataReturn.data.password;
    return dataReturn;
  }

  async cekAttempt(
    user: User & { loginAttempt: Login_Attempt },
  ): Promise<{ status: boolean; second?: number }> {
    let res = true;
    let second = 0;
    if (user.loginAttempt) {
      if (user.loginAttempt.limitTime) {
        const nowDateTime: number = new Date().getTime() / 1000;
        let sub = nowDateTime - user.loginAttempt.limitTime.getTime() / 1000;
        sub = Math.round(sub);
        if (sub < 0) {
          res = false;
          return {
            status: res,
            second: Math.abs(sub),
          };
        }
      }
      if (user.loginAttempt.countAttempt >= 3) {
        const date = new Date();
        date.setMinutes(date.getMinutes() + 3);
        await this.prisma.login_Attempt
          .update({
            where: {
              userId: user.id,
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
            userId: user.id,
          },
          data: {
            countAttempt: ++user.loginAttempt.countAttempt,
          },
        });
      }
    } else {
      await this.prisma.login_Attempt.create({
        data: {
          userId: user.id,
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
