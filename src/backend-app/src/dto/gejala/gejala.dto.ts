import { IsString, IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GejalaDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
