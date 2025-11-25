import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  register(
    @Body()
    body: {
      email: string;
      password: string;
      name?: string;
      storeId: string;
    },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  login(
    @Body()
    body: {
      email: string;
      password: string;
      storeId: string;
    },
  ) {
    return this.authService.login(body.email, body.password, body.storeId);
  }

  @Get('validate/:userId')
  validateUser(@Param('userId') userId: string) {
    return this.authService.validateUser(userId);
  }
}
