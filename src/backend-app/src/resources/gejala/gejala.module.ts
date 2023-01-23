import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '../../guards/jwt/jwt.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { GejalaController } from './gejala.controller';
import { GejalaService } from './gejala.service';

@Module({
  controllers: [GejalaController],
  providers: [GejalaService],
  imports: [PrismaModule, JwtModule, PaginationModule],
})
export class GejalaModule {}
