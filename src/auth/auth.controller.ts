import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req) {
    const data = await this.authService.login(req.user);
    return {
      message: 'login exitoso',
      data,
    };
  }
  // @UseGuards(LocalAuthGuard)
  // @Post('logindto')
  // async loginDto(@Body() loginUserDto: LoginUserDto) {
  //   const user = new User();
  //   user.email = loginUserDto.email;
  //   user.password = loginUserDto.password;
  //   const data = await this.authService.login(user);
  //   return {
  //     message: 'login exitoso',
  //     data,
  //   };
  // }
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
