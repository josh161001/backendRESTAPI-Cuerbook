import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EmailDto {
  @ApiProperty({ example: 'l19480829@nuevoleon.tecnm.mx' })
  @IsEmail()
  email: string;
}
