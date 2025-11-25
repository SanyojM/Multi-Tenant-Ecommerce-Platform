import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Database helper functions for testing
 */
export class TestDatabaseHelper {
  constructor(private prismaService: PrismaService) {}

  /**
   * Clean up all test data from the database
   */
  async cleanupDatabase(): Promise<void> {
    // Delete in order of dependencies to avoid foreign key constraints
    await this.prismaService.cartItem.deleteMany();
    await this.prismaService.orderItem.deleteMany();
    await this.prismaService.order.deleteMany();
    await this.prismaService.payment.deleteMany();
    await this.prismaService.address.deleteMany();
    await this.prismaService.product.deleteMany();
    await this.prismaService.variantOption.deleteMany();
    await this.prismaService.variant.deleteMany();
    await this.prismaService.category.deleteMany();
    await this.prismaService.user.deleteMany();
    await this.prismaService.storeAdmin.deleteMany();
    await this.prismaService.store.deleteMany();
  }

  /**
   * Create a test store for use in tests
   */
  async createTestStore(data?: Partial<{
    name: string;
    description: string;
    logoUrl: string;
    domain: string;
  }>) {
    return await this.prismaService.store.create({
      data: {
        name: data?.name ?? 'Test Store',
        description: data?.description ?? 'A test store',
        logoUrl: data?.logoUrl ?? null,
        domain: data?.domain ?? null,
      },
    });
  }

  /**
   * Create a test category for use in tests
   */
  async createTestCategory(storeId: string, data?: Partial<{
    name: string;
    imageUrl: string;
  }>) {
    return await this.prismaService.category.create({
      data: {
        name: data?.name ?? 'Test Category',
        storeId,
        imageUrl: data?.imageUrl ?? null,
      },
    });
  }

  /**
   * Create a test user for use in tests
   */
  async createTestUser(storeId: string, data?: Partial<{
    email: string;
    password: string;
    name: string;
    isAdmin: boolean;
  }>) {
    return await this.prismaService.user.create({
      data: {
        email: data?.email ?? 'test@example.com',
        password: data?.password ?? 'password123',
        name: data?.name ?? 'Test User',
        storeId,
        isAdmin: data?.isAdmin ?? false,
      },
    });
  }

  /**
   * Create a test product for use in tests
   */
  async createTestProduct(storeId: string, categoryId: string, data?: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    specs: any;
    imageGallery: string[];
    graphics: string[];
  }>) {
    return await this.prismaService.product.create({
      data: {
        name: data?.name ?? 'Test Product',
        description: data?.description ?? 'A test product',
        price: data?.price ?? 99.99,
        stock: data?.stock ?? 10,
        categoryId,
        storeId,
        specs: data?.specs ?? null,
        imageGallery: data?.imageGallery ?? [],
        graphics: data?.graphics ?? [],
      },
    });
  }

  /**
   * Create a test address for use in tests
   */
  async createTestAddress(userId: string, data?: Partial<{
    fullName: string;
    phone: string;
    pincode: string;
    city: string;
    state: string;
    country: string;
    addressLine1: string;
    addressLine2: string;
  }>) {
    return await this.prismaService.address.create({
      data: {
        fullName: data?.fullName ?? 'Test User',
        phone: data?.phone ?? '1234567890',
        pincode: data?.pincode ?? '123456',
        city: data?.city ?? 'Test City',
        state: data?.state ?? 'Test State',
        country: data?.country ?? 'Test Country',
        addressLine1: data?.addressLine1 ?? '123 Test Street',
        addressLine2: data?.addressLine2 ?? null,
        userId,
      },
    });
  }

  /**
   * Wait for a specified amount of time (useful for async operations)
   */
  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Mock file object for testing file uploads
 */
export const createMockFile = (
  filename: string = 'test-image.jpg',
  mimetype: string = 'image/jpeg',
  size: number = 1024
): Express.Multer.File => ({
  fieldname: 'image',
  originalname: filename,
  encoding: '7bit',
  mimetype,
  buffer: Buffer.from('fake-image-data'),
  size,
  stream: null,
  destination: '',
  filename: '',
  path: '',
});

/**
 * Environment setup for tests
 */
export const setupTestEnvironment = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  
  // Mock environment variables that might be needed
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  }
  
  if (!process.env.SUPABASE_API_URL) {
    process.env.SUPABASE_API_URL = 'https://mock-supabase-url.supabase.co';
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
  }
  
  if (!process.env.VPS_IP) {
    process.env.VPS_IP = '127.0.0.1';
  }
};

/**
 * Custom matchers for testing
 */
export const customMatchers = {
  /**
   * Check if a string is a valid CUID
   */
  toBeValidCuid: (received: string) => {
    const cuidRegex = /^c[a-z0-9]{24}$/;
    const pass = cuidRegex.test(received);
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid CUID`,
      pass,
    };
  },

  /**
   * Check if a string is a valid URL
   */
  toBeValidUrl: (received: string) => {
    try {
      new URL(received);
      return { message: () => `expected ${received} not to be a valid URL`, pass: true };
    } catch {
      return { message: () => `expected ${received} to be a valid URL`, pass: false };
    }
  },

  /**
   * Check if a date is recent (within the last 5 seconds)
   */
  toBeRecent: (received: Date | string) => {
    const date = typeof received === 'string' ? new Date(received) : received;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const pass = diff >= 0 && diff <= 5000; // 5 seconds
    return {
      message: () => `expected ${date.toISOString()} ${pass ? 'not ' : ''}to be recent`,
      pass,
    };
  },
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidCuid(): R;
      toBeValidUrl(): R;
      toBeRecent(): R;
    }
  }
}
