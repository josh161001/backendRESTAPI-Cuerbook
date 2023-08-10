import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'l19480829@nuevoleon.tecnm.mx' })
  @IsEmail()
  email: string;

  @IsString()
  @ApiProperty({ example: '161001' })
  password: string;
}
