import {
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorator/auth';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req) {
    try {
      const data = await this.authService.login(req.user);
      return {
        message: 'login exitoso',
        data,
      };
    } catch (error) {
      throw new UnauthorizedException('Las credenciales no coinciden');
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req): any {
    const user = req.user;

    return {
      message: 'token activo',
      user,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  async tokenRefresh(@Req() req) {
    const data = await this.authService.login(req.user);
    return {
      message: 'refresh exitoso',
      data,
    };
  }
}
