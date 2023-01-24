import { IsString, IsNotEmpty, ValidateNested, IsOptional} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GejalaDto } from 'src/dto/gejala/gejala.dto';

export class CheckInDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  penyakit: string;

  @ApiProperty()
  pasien_id: string;

  @ApiProperty({ type: () => [GejalaDto] })
  @ValidateNested({ each: true })
  @Type(() => GejalaDto)
  @IsOptional()
  gejala: GejalaDto[];
}
