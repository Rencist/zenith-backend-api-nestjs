import { IsString, IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  penyakit: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pasien_id: string;
}
