import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Grupo de Gestion empresarial' })
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiProperty({ example: 'l19480829@nuevoleon.tecnm.mx' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '161001' })
  @MinLength(6)
  @MaxLength(60)
  @IsString()
  password: string;
}
