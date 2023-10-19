import { PartialType } from '@nestjs/swagger';
import { passwordDto } from './password.dto';

export class UpdatePasswordUserDto extends PartialType(passwordDto) {}
