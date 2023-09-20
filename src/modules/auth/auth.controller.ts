import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { User } from 'src/common/decorator/user.decorator';
import { User as EntityUser } from '../users/entities/user.entity';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginUserDto, @User() user: EntityUser) {
    try {
      const data = await this.authService.login(user);
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
  profile(@Req() req) {
    const user = req.user;

    delete user.password;

    return {
      message: 'token activo',
      user,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  async tokenRefresh(@Req() req: any) {
    const data = await this.authService.login(req.user);
    return {
      message: 'refresh exitoso',
      data,
    };
  }
}
