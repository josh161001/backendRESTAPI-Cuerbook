import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AppRoles } from 'src/app.roles';
import { EnumToString } from 'src/common/enum/enum';

export class CreateUserDto {
  @ApiProperty({ example: 'Gestion empresarial' })
  @MaxLength(255)
  @IsString()
  department: string;

  @ApiProperty({ example: 'Gestion empresarial' })
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

  @ApiProperty()
  imagen: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  @IsArray()
  @IsEnum(AppRoles, {
    each: true,
    message: `Los roles validos son ${EnumToString(AppRoles)}}`,
  })
  roles: string[];
}
