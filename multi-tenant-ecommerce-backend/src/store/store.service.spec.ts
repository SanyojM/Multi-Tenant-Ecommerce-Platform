import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, BadRequestException } from '@nestjs/common';

// Mock the external dependencies
jest.mock('dns/promises');
jest.mock('fs/promises');
jest.mock('child_process');

describe('StoreService', () => {
  let service: StoreService;
  let prismaService: any;

  const mockStore = {
    id: 'test-store-id',
    name: 'Test Store',
    description: 'Test Description',
    logoUrl: 'https://example.com/logo.png',
    domain: 'teststore.com',
    domainStatus: 'PENDING',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      store: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
    prismaService = module.get(PrismaService);
  });

  describe('getStoreById', () => {
    it('should return a store by id', async () => {
      prismaService.store.findUnique.mockResolvedValue(mockStore);

      const result = await service.getStoreById('test-store-id');

      expect(result).toEqual(mockStore);
    });

    it('should throw HttpException on database error', async () => {
      const error = new Error('Database error');
      prismaService.store.findUnique.mockRejectedValue(error);

      await expect(service.getStoreById('test-store-id')).rejects.toThrow(HttpException);
    });
  });

  describe('getAllStores', () => {
    it('should return all stores', async () => {
      const stores = [mockStore];
      prismaService.store.findMany.mockResolvedValue(stores);

      const result = await service.getAllStores();

      expect(result).toEqual(stores);
    });

    it('should throw HttpException on database error', async () => {
      const error = new Error('Database error');
      prismaService.store.findMany.mockRejectedValue(error);

      await expect(service.getAllStores()).rejects.toThrow(HttpException);
    });
  });

  describe('createStore', () => {
    const createData = {
      name: 'New Store',
      description: 'New Store Description',
    };

    it('should create a store successfully', async () => {
      prismaService.store.create.mockResolvedValue(mockStore);

      const result = await service.createStore(createData);

      expect(result).toEqual(mockStore);
    });

    it('should throw HttpException on creation failure', async () => {
      const error = new Error('Creation failed');
      prismaService.store.create.mockRejectedValue(error);

      await expect(service.createStore(createData)).rejects.toThrow(HttpException);
    });
  });

  describe('setDomain', () => {
    const validDomain = 'example.com';
    const invalidDomain = 'invalid-domain';

    it('should set domain successfully', async () => {
      const updatedStore = { ...mockStore, domain: validDomain };
      prismaService.store.findUnique.mockResolvedValue(mockStore);
      prismaService.store.update.mockResolvedValue(updatedStore);

      const result = await service.setDomain('test-store-id', validDomain);

      expect(result).toEqual(updatedStore);
    });

    it('should throw exception for invalid domain format', async () => {
      prismaService.store.findUnique.mockResolvedValue(mockStore);

      await expect(service.setDomain('test-store-id', invalidDomain)).rejects.toThrow(
        'Invalid domain format'
      );
    });
  });
});
