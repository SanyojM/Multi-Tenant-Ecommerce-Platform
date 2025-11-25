import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async createUser(data: {
    email: string;
    password: string;
    name?: string;
    storeId: string;
    isAdmin?: boolean;
  }) {
    try {
      // Check if user already exists
      const existingUser = await this.prismaService.user.findFirst({
        where: { email: data.email, storeId: data.storeId },
      });

      if (existingUser) {
        throw new HttpException('User already exists with this email', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await this.prismaService.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          storeId: data.storeId,
          isAdmin: data.isAdmin || false,
        },
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create user', 400);
    }
  }

  async findByEmail(email: string, storeId: string) {
    try {
      return await this.prismaService.user.findFirst({
        where: { email, storeId },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to find user', 400);
    }
  }

  async findById(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });
      
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new HttpException(error.message || 'Failed to find user', 400);
    }
  }

  async getAllUsers(storeId: string) {
    try {
      const users = await this.prismaService.user.findMany({
        where: { storeId },
      });

      return users.map(({ password, ...user }) => user);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get users', 400);
    }
  }

  async updateUser(id: string, data: Partial<{ name: string; email: string }>) {
    try {
      const user = await this.prismaService.user.update({
        where: { id },
        data,
      });

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new HttpException(error.message || 'Failed to update user', 400);
    }
  }

  async deleteUser(id: string) {
    try {
      return await this.prismaService.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to delete user', 400);
    }
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
