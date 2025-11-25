import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dtos/create-store.dto';
import { UpdateStoreDto } from './dtos/update-store.dto';
import { HttpException, BadRequestException } from '@nestjs/common';
import { DomainStatus } from '@prisma/client';

describe('StoreController', () => {
  let controller: StoreController;
  let storeService: jest.Mocked<StoreService>;

  const mockStore = {
    id: 'test-store-id',
    name: 'Test Store',
    description: 'Test Description',
    logoUrl: 'https://example.com/logo.png',
    domain: 'teststore.com',
    domainStatus: DomainStatus.PENDING,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStoreService = {
    verifyDomain: jest.fn(),
    createStore: jest.fn(),
    setDomain: jest.fn(),
    getStoreById: jest.fn(),
    getStoreDetailsByDomain: jest.fn(),
    getAllStores: jest.fn(),
    updateStore: jest.fn(),
    deleteStore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        {
          provide: StoreService,
          useValue: mockStoreService,
        },
      ],
    }).compile();

    controller = module.get<StoreController>(StoreController);
    storeService = module.get(StoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyDomain', () => {
    it('should verify domain successfully', async () => {
      const verifyResult = { success: true, message: 'Domain verified', store: mockStore };
      storeService.verifyDomain.mockResolvedValue(verifyResult);

      const result = await controller.verifyDomain('teststore.com');

      expect(result).toEqual(verifyResult);
      expect(storeService.verifyDomain).toHaveBeenCalledWith('teststore.com');
    });

    it('should throw BadRequestException for invalid domain', async () => {
      storeService.verifyDomain.mockRejectedValue(
        new BadRequestException('Domain is not pointing to VPS IP')
      );

      await expect(controller.verifyDomain('invalid-domain.com')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('createStore', () => {
    const createStoreDto: CreateStoreDto = {
      name: 'New Store',
      description: 'New Store Description',
      logoUrl: 'https://example.com/logo.png',
      domain: 'newstore.com',
    };

    it('should create store successfully', async () => {
      storeService.createStore.mockResolvedValue(mockStore);

      const result = await controller.createStore(createStoreDto);

      expect(result).toEqual(mockStore);
      expect(storeService.createStore).toHaveBeenCalledWith(createStoreDto);
    });

    it('should throw HttpException on creation failure', async () => {
      storeService.createStore.mockRejectedValue(new HttpException('Creation failed', 400));

      await expect(controller.createStore(createStoreDto)).rejects.toThrow(HttpException);
    });
  });

  describe('setDomain', () => {
    it('should set domain successfully', async () => {
      const updatedStore = { ...mockStore, domain: 'newdomain.com', domainStatus: DomainStatus.PENDING };
      storeService.setDomain.mockResolvedValue(updatedStore);

      const result = await controller.setDomain('test-store-id', 'newdomain.com');

      expect(result).toEqual(updatedStore);
      expect(storeService.setDomain).toHaveBeenCalledWith('test-store-id', 'newdomain.com');
    });

    it('should throw BadRequestException for invalid domain format', async () => {
      storeService.setDomain.mockRejectedValue(new BadRequestException('Invalid domain format'));

      await expect(controller.setDomain('test-store-id', 'invalid-domain')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getStoreById', () => {
    it('should return store by id', async () => {
      storeService.getStoreById.mockResolvedValue(mockStore);

      const result = await controller.getStoreById('test-store-id');

      expect(result).toEqual(mockStore);
      expect(storeService.getStoreById).toHaveBeenCalledWith('test-store-id');
    });

    it('should return null when store not found', async () => {
      storeService.getStoreById.mockResolvedValue(null);

      const result = await controller.getStoreById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getStoreByDomain', () => {
    it('should return store by domain', async () => {
      storeService.getStoreDetailsByDomain.mockResolvedValue(mockStore);

      const result = await controller.getStoreByDomain('teststore.com');

      expect(result).toEqual(mockStore);
      expect(storeService.getStoreDetailsByDomain).toHaveBeenCalledWith('teststore.com');
    });

    it('should return null when store not found', async () => {
      storeService.getStoreDetailsByDomain.mockResolvedValue(null);

      const result = await controller.getStoreByDomain('non-existent-domain.com');

      expect(result).toBeNull();
    });
  });

  describe('getAllStores', () => {
    it('should return all stores', async () => {
      const stores = [mockStore];
      storeService.getAllStores.mockResolvedValue(stores);

      const result = await controller.getAllStores();

      expect(result).toEqual(stores);
      expect(storeService.getAllStores).toHaveBeenCalled();
    });

    it('should return empty array when no stores exist', async () => {
      storeService.getAllStores.mockResolvedValue([]);

      const result = await controller.getAllStores();

      expect(result).toEqual([]);
    });
  });

  describe('updateStore', () => {
    const updateStoreDto: UpdateStoreDto = {
      name: 'Updated Store Name',
      description: 'Updated Description',
    };

    it('should update store successfully', async () => {
      const updatedStore = { ...mockStore, ...updateStoreDto };
      storeService.updateStore.mockResolvedValue(updatedStore);

      const result = await controller.updateStore('test-store-id', updateStoreDto);

      expect(result).toEqual(updatedStore);
      expect(storeService.updateStore).toHaveBeenCalledWith('test-store-id', updateStoreDto);
    });

    it('should throw HttpException when store not found', async () => {
      storeService.updateStore.mockRejectedValue(new HttpException('Store not found', 404));

      await expect(controller.updateStore('non-existent-id', updateStoreDto)).rejects.toThrow(
        new HttpException('Store not found', 404)
      );
    });
  });

  describe('deleteStore', () => {
    it('should delete store successfully', async () => {
      storeService.deleteStore.mockResolvedValue(mockStore);

      const result = await controller.deleteStore('test-store-id');

      expect(result).toEqual(mockStore);
      expect(storeService.deleteStore).toHaveBeenCalledWith('test-store-id');
    });

    it('should throw HttpException when store not found', async () => {
      storeService.deleteStore.mockRejectedValue(new HttpException('Store not found', 404));

      await expect(controller.deleteStore('non-existent-id')).rejects.toThrow(
        new HttpException('Store not found', 404)
      );
    });
  });
});
