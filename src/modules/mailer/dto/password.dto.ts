import { ApiProperty } from '@nestjs/swagger';

export class passwordDto {
  @ApiProperty()
  password: string;
}
