import { Injectable, HttpException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prismaService: PrismaService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    name?: string;
    storeId: string;
  }) {
    try {
      const user = await this.userService.createUser(data);
      return { user, message: 'Registration successful' };
    } catch (error) {
      throw new HttpException(error.message || 'Registration failed', 400);
    }
  }

  async login(email: string, password: string, storeId: string) {
    try {
      // Find user
      const user = await this.userService.findByEmail(email, storeId);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Validate password
      const isPasswordValid = await this.userService.validatePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, message: 'Login successful' };
    } catch (error) {
      throw new HttpException(error.message || 'Login failed', 401);
    }
  }

  async validateUser(userId: string) {
    try {
      return await this.userService.findById(userId);
    } catch (error) {
      throw new HttpException('User validation failed', 401);
    }
  }
}
