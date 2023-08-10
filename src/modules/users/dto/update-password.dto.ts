import { PartialType } from '@nestjs/swagger';
import { SavePasswordDto } from './save-password.dto';

export class UpdatePasswordDto extends PartialType(SavePasswordDto) {}
