import { Controller, Get, Patch, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('store/:storeId')
  getStoreUsers(@Param('storeId') storeId: string) {
    return this.userService.getAllUsers(storeId);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  updateUser(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string },
  ) {
    return this.userService.updateUser(id, body);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
