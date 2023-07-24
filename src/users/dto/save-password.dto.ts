import { ApiProperty } from '@nestjs/swagger';

export class SavePasswordDto {
  @ApiProperty()
  password: string;

  @ApiProperty()
  newPassword: string;
}
