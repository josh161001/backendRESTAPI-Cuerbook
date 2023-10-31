import { Category } from './../../categories/entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Evento por el dia de contabilidad' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://wwww.hola.comoestas' })
  @IsString()
  imagen: string;

  @ApiProperty()
  @IsDate()
  fecha: Date;

  @ApiProperty()
  @IsString()
  lugar: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  categoryId: number;

  @ApiProperty()
  @IsNumber()
  cupo: number;

  @ApiProperty()
  status: boolean;
}
