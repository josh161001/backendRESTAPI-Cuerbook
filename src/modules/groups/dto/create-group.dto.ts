import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @ApiProperty({ example: 'Grupo de contabilidad' })
  name: string;

  @IsString()
  @ApiProperty({
    example:
      'https://i3w3g8c7.rocketcdn.me/wp-content/uploads/2019/04/contabilidad-1024x776.jpg.webp',
  })
  imagen: string;

  @IsString()
  @ApiProperty({
    example: 'Grupo de contabilidad de la carrera de Gestion empresarial',
  })
  description: string;

  @ApiProperty({ example: '1' })
  @IsInt()
  categoryId: number;
}
