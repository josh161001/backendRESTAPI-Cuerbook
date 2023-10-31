import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateNoticeDto {
  @IsString()
  @ApiProperty({ example: 'ya hay gym cuervo' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'httpp://www.google.com' })
  imagen: string;

  @ApiProperty()
  status: boolean;

  @IsString()
  @ApiProperty({ example: 'ya hay gym cuervo en el tecnologico de nuevo leon' })
  description: string;
}
