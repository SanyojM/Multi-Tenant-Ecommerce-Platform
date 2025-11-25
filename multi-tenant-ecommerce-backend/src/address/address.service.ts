import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private prismaService: PrismaService) {}

  async createAddress(data: {
    userId: string;
    fullName: string;
    phone: string;
    pincode: string;
    city: string;
    state: string;
    country: string;
    addressLine1: string;
    addressLine2?: string;
  }) {
    try {
      return await this.prismaService.address.create({
        data,
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create address', 400);
    }
  }

  async getUserAddresses(userId: string) {
    try {
      return await this.prismaService.address.findMany({
        where: { userId },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get addresses', 400);
    }
  }

  async getAddressById(id: string) {
    try {
      return await this.prismaService.address.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get address', 400);
    }
  }

  async updateAddress(id: string, data: Partial<{
    fullName: string;
    phone: string;
    pincode: string;
    city: string;
    state: string;
    country: string;
    addressLine1: string;
    addressLine2?: string;
  }>) {
    try {
      return await this.prismaService.address.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to update address', 400);
    }
  }

  async deleteAddress(id: string) {
    try {
      return await this.prismaService.address.delete({
        where: { id },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to delete address', 400);
    }
  }
}
