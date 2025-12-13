import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  constructor(private prismaService: PrismaService) {}

  async loginAdmin(email: string, password: string) {
    try {
      // Find admin user
      const admin = await this.prismaService.storeAdmin.findUnique({
        where: { email },
        include: { 
          store: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              isActive: true,
            }
          }
        },
      });

      if (!admin) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Return admin without password
      const { password: _, ...adminWithoutPassword } = admin;
      
      return { 
        admin: adminWithoutPassword, 
        message: 'Login successful' 
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async createAdmin(data: {
    email: string;
    password: string;
    name?: string;
    role: 'SUPER_ADMIN' | 'STORE_OWNER';
    storeId?: string;
  }) {
    try {
      // Check if admin already exists
      const existingAdmin = await this.prismaService.storeAdmin.findUnique({
        where: { email: data.email },
      });

      if (existingAdmin) {
        throw new ConflictException('Admin with this email already exists');
      }

      // For store owners, validate that store exists and doesn't have an owner yet
      if (data.role === 'STORE_OWNER' && data.storeId) {
        const store = await this.prismaService.store.findUnique({
          where: { id: data.storeId },
        });

        if (!store) {
          throw new UnauthorizedException('Store not found');
        }

        // Check if store already has an owner
        const existingOwner = await this.prismaService.storeAdmin.findFirst({
          where: { 
            storeId: data.storeId,
            role: 'STORE_OWNER'
          },
        });

        if (existingOwner) {
          throw new ConflictException('Store already has an owner');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create admin
      const admin = await this.prismaService.storeAdmin.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.role,
          storeId: data.storeId,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            }
          }
        }
      });

      const { password: _, ...adminWithoutPassword } = admin;
      return { 
        admin: adminWithoutPassword, 
        message: 'Admin created successfully' 
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new ConflictException('Failed to create admin');
    }
  }

  async validateAdmin(adminId: string) {
    try {
      const admin = await this.prismaService.storeAdmin.findUnique({
        where: { id: adminId },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              isActive: true,
            }
          }
        },
      });

      if (!admin) {
        throw new UnauthorizedException('Admin not found');
      }

      const { password: _, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    } catch (error) {
      throw new UnauthorizedException('Admin validation failed');
    }
  }

  async getAllStores() {
    return this.prismaService.store.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        isActive: true,
        domain: true,
        domainStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
