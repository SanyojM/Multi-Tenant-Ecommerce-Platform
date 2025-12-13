import { Controller, Post, Body, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';

@Controller('auth/admin')
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  @Post('login')
  @UsePipes(ValidationPipe)
  loginAdmin(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.adminAuthService.loginAdmin(body.email, body.password);
  }

  @Post('create')
  @UsePipes(ValidationPipe)
  createAdmin(
    @Body()
    body: {
      email: string;
      password: string;
      name?: string;
      role: 'SUPER_ADMIN' | 'STORE_OWNER';
      storeId?: string;
    },
  ) {
    return this.adminAuthService.createAdmin(body);
  }

  @Get('validate/:adminId')
  validateAdmin(@Param('adminId') adminId: string) {
    return this.adminAuthService.validateAdmin(adminId);
  }

  @Get('stores')
  getAllStores() {
    return this.adminAuthService.getAllStores();
  }
}
