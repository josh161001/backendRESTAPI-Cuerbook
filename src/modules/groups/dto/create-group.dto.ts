import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @ApiProperty({ example: 'Grupo de contabilidad' })
  name: string;

  @ApiProperty()
  imagen: string;

  @IsString()
  @ApiProperty({
    example: 'Grupo de contabilidad de la carrera de Gestion empresarial',
  })
  description: string;

  @ApiProperty()
  status: boolean;
}
