import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '../../guards/jwt/jwt.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { CheckInController } from './check_in.controller';
import { CheckInService } from './check_in.service';

@Module({
  controllers: [CheckInController],
  providers: [CheckInService],
  imports: [PrismaModule, JwtModule, PaginationModule],
})
export class CheckInModule {}
