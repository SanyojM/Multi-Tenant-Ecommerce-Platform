import { Controller, Post, Get, Patch, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createAddress(
    @Body()
    body: {
      userId: string;
      fullName: string;
      phone: string;
      pincode: string;
      city: string;
      state: string;
      country: string;
      addressLine1: string;
      addressLine2?: string;
    },
  ) {
    return this.addressService.createAddress(body);
  }

  @Get('user/:userId')
  getUserAddresses(@Param('userId') userId: string) {
    return this.addressService.getUserAddresses(userId);
  }

  @Get(':id')
  getAddressById(@Param('id') id: string) {
    return this.addressService.getAddressById(id);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  updateAddress(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      fullName: string;
      phone: string;
      pincode: string;
      city: string;
      state: string;
      country: string;
      addressLine1: string;
      addressLine2?: string;
    }>,
  ) {
    return this.addressService.updateAddress(id, body);
  }

  @Delete(':id')
  deleteAddress(@Param('id') id: string) {
    return this.addressService.deleteAddress(id);
  }
}
