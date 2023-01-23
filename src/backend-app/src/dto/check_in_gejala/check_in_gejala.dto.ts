import { IsString, IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInGejalaDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  gejala_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  check_in_id: string;
}
