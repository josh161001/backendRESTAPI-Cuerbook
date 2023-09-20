import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ACGuard, Role, UseRoles } from 'nest-access-control';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    UseGuards(AuthGuard('jwt'), ACGuard),
    UseRoles(...roles),
    ApiBearerAuth(),
  );
}
