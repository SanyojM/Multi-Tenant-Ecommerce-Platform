import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { HttpException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: any;
  let supabaseService: any;

  const mockStore = {
    id: 'store-id-1',
    name: 'Test Store',
    description: 'Test Description',
    logoUrl: null,
    isActive: true,
    domain: null,
    domainStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory = {
    id: 'category-id-1',
    name: 'Electronics',
    storeId: 'store-id-1',
    imageUrl: 'https://example.com/image.jpg',
  };

  const mockImageFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    size: 1024,
    stream: null,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      store: {
        findUnique: jest.fn(),
      },
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const mockSupabaseService = {
      uploadCategoryImage: jest.fn(),
      deleteCategoryImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get(PrismaService);
    supabaseService = module.get(SupabaseService);
  });

  describe('createCategory', () => {
    const storeId = 'store-id-1';
    const categoryData = {
      name: 'Electronics',
    };

    it('should create category without image', async () => {
      prismaService.store.findUnique.mockResolvedValue(mockStore);
      prismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.createCategory(storeId, categoryData);

      expect(result).toEqual(mockCategory);
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: storeId },
      });
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: {
          name: categoryData.name,
          storeId,
          imageUrl: undefined,
        },
      });
    });

    it('should create category with image', async () => {
      const imageUrl = 'https://supabase.com/storage/category-12345-test-image.jpg';
      const categoryWithImage = { ...mockCategory, imageUrl };

      prismaService.store.findUnique.mockResolvedValue(mockStore);
      supabaseService.uploadCategoryImage.mockResolvedValue(imageUrl);
      prismaService.category.create.mockResolvedValue(categoryWithImage);

      const result = await service.createCategory(storeId, {
        ...categoryData,
        imageFile: mockImageFile,
      });

      expect(result).toEqual(categoryWithImage);
      expect(supabaseService.uploadCategoryImage).toHaveBeenCalledWith(
        mockImageFile.buffer,
        expect.stringMatching(/^category-\d+-test-image\.jpg$/)
      );
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: {
          name: categoryData.name,
          storeId,
          imageUrl,
        },
      });
    });

    it('should throw HttpException when store not found', async () => {
      prismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.createCategory(storeId, categoryData)).rejects.toThrow(
        'Failed to create category: Store not found'
      );
    });

    it('should throw HttpException on creation failure', async () => {
      const error = new Error('Creation failed');
      prismaService.store.findUnique.mockResolvedValue(mockStore);
      prismaService.category.create.mockRejectedValue(error);

      await expect(service.createCategory(storeId, categoryData)).rejects.toThrow('Creation failed');
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories for a store', async () => {
      const categories = [mockCategory];
      prismaService.category.findMany.mockResolvedValue(categories);

      const result = await service.getAllCategories('store-id-1');

      expect(result).toEqual(categories);
      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: { storeId: 'store-id-1' },
      });
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      prismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.getCategoryById('category-id-1');

      expect(result).toEqual(mockCategory);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
      });
    });

    it('should throw HttpException on database error', async () => {
      const error = new Error('Database error');
      prismaService.category.findUnique.mockRejectedValue(error);

      await expect(service.getCategoryById('category-id-1')).rejects.toThrow('Database error');
    });
  });

  describe('updateCategory', () => {
    const updateData = {
      name: 'Updated Electronics',
    };

    it('should update category without changing image', async () => {
      const updatedCategory = { ...mockCategory, ...updateData };
      prismaService.category.findUnique.mockResolvedValue(mockCategory);
      prismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory('category-id-1', updateData);

      expect(result).toEqual(updatedCategory);
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
        data: {
          ...updateData,
          imageUrl: mockCategory.imageUrl,
        },
      });
    });

    it('should update category with new image', async () => {
      const newImageUrl = 'https://supabase.com/storage/category-67890-new-image.jpg';
      const updatedCategory = { ...mockCategory, ...updateData, imageUrl: newImageUrl };

      prismaService.category.findUnique.mockResolvedValue(mockCategory);
      supabaseService.deleteCategoryImage.mockResolvedValue();
      supabaseService.uploadCategoryImage.mockResolvedValue(newImageUrl);
      prismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory('category-id-1', {
        ...updateData,
        imageFile: mockImageFile,
      });

      expect(result).toEqual(updatedCategory);
      expect(supabaseService.deleteCategoryImage).toHaveBeenCalledWith(mockCategory.imageUrl);
      expect(supabaseService.uploadCategoryImage).toHaveBeenCalledWith(
        mockImageFile.buffer,
        expect.stringMatching(/^category-\d+-test-image\.jpg$/)
      );
    });

    it('should throw HttpException when category not found', async () => {
      prismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.updateCategory('category-id-1', updateData)).rejects.toThrow(
        'Failed to update category: Category not found'
      );
    });

    it('should throw HttpException on update failure', async () => {
      const error = new Error('Update failed');
      prismaService.category.findUnique.mockResolvedValue(mockCategory);
      prismaService.category.update.mockRejectedValue(error);

      await expect(service.updateCategory('category-id-1', updateData)).rejects.toThrow(
        HttpException
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete category without image', async () => {
      const categoryWithoutImage = { ...mockCategory, imageUrl: null };
      prismaService.category.findUnique.mockResolvedValue(categoryWithoutImage);
      prismaService.category.delete.mockResolvedValue(categoryWithoutImage);

      const result = await service.deleteCategory('category-id-1');

      expect(result).toEqual(categoryWithoutImage);
      expect(prismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
      });
      expect(supabaseService.deleteCategoryImage).not.toHaveBeenCalled();
    });

    it('should delete category with image', async () => {
      prismaService.category.findUnique.mockResolvedValue(mockCategory);
      supabaseService.deleteCategoryImage.mockResolvedValue();
      prismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.deleteCategory('category-id-1');

      expect(result).toEqual(mockCategory);
      expect(supabaseService.deleteCategoryImage).toHaveBeenCalledWith(mockCategory.imageUrl);
      expect(prismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
      });
    });

    it('should throw HttpException when category not found', async () => {
      prismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.deleteCategory('category-id-1')).rejects.toThrow(
        'Failed to delete category: Category not found'
      );
    });

    it('should throw HttpException on deletion failure', async () => {
      const error = new Error('Deletion failed');
      prismaService.category.findUnique.mockResolvedValue(mockCategory);
      prismaService.category.delete.mockRejectedValue(error);

      await expect(service.deleteCategory('category-id-1')).rejects.toThrow(HttpException);
    });
  });
});
