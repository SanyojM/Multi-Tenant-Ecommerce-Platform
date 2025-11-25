import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { BadRequestException, HttpException } from '@nestjs/common';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: jest.Mocked<CategoryService>;

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

  const mockCategoryService = {
    createCategory: jest.fn(),
    getAllCategories: jest.fn(),
    getCategoryById: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    const createCategoryBody = {
      name: 'Electronics',
      storeId: 'store-id-1',
    };

    it('should create category without image', async () => {
      categoryService.createCategory.mockResolvedValue(mockCategory);

      const result = await controller.createCategory(createCategoryBody, undefined);

      expect(result).toEqual(mockCategory);
      expect(categoryService.createCategory).toHaveBeenCalledWith('store-id-1', {
        name: 'Electronics',
        imageFile: undefined,
      });
    });

    it('should create category with image', async () => {
      const categoryWithImage = { ...mockCategory, imageUrl: 'https://supabase.com/uploaded-image.jpg' };
      categoryService.createCategory.mockResolvedValue(categoryWithImage);

      const result = await controller.createCategory(createCategoryBody, mockImageFile);

      expect(result).toEqual(categoryWithImage);
      expect(categoryService.createCategory).toHaveBeenCalledWith('store-id-1', {
        name: 'Electronics',
        imageFile: mockImageFile,
      });
    });

    it('should throw BadRequestException when storeId is missing', async () => {
      const bodyWithoutStoreId = { name: 'Electronics' } as any;

      await expect(controller.createCategory(bodyWithoutStoreId, undefined)).rejects.toThrow(
        new BadRequestException('storeId is required')
      );
    });

    it('should throw HttpException on service failure', async () => {
      categoryService.createCategory.mockRejectedValue(
        new HttpException('Failed to create category', 500)
      );

      await expect(controller.createCategory(createCategoryBody, undefined)).rejects.toThrow(
        HttpException
      );
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories for a store', async () => {
      const categories = [mockCategory];
      categoryService.getAllCategories.mockResolvedValue(categories);

      const result = await controller.getAllCategories('store-id-1');

      expect(result).toEqual(categories);
      expect(categoryService.getAllCategories).toHaveBeenCalledWith('store-id-1');
    });

    it('should return empty array when no categories exist', async () => {
      categoryService.getAllCategories.mockResolvedValue([]);

      const result = await controller.getAllCategories('store-id-1');

      expect(result).toEqual([]);
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      categoryService.getCategoryById.mockResolvedValue(mockCategory);

      const result = await controller.getCategoryById('category-id-1');

      expect(result).toEqual(mockCategory);
      expect(categoryService.getCategoryById).toHaveBeenCalledWith('category-id-1');
    });

    it('should return null when category not found', async () => {
      categoryService.getCategoryById.mockResolvedValue(null);

      const result = await controller.getCategoryById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateCategory', () => {
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Updated Electronics',
    };

    it('should update category without changing image', async () => {
      const updatedCategory = { ...mockCategory, ...updateCategoryDto };
      categoryService.updateCategory.mockResolvedValue(updatedCategory);

      const result = await controller.updateCategory('category-id-1', updateCategoryDto, undefined);

      expect(result).toEqual(updatedCategory);
      expect(categoryService.updateCategory).toHaveBeenCalledWith('category-id-1', {
        ...updateCategoryDto,
        imageFile: undefined,
      });
    });

    it('should update category with new image', async () => {
      const updatedCategory = { 
        ...mockCategory, 
        ...updateCategoryDto, 
        imageUrl: 'https://supabase.com/new-image.jpg' 
      };
      categoryService.updateCategory.mockResolvedValue(updatedCategory);

      const result = await controller.updateCategory(
        'category-id-1',
        updateCategoryDto,
        mockImageFile
      );

      expect(result).toEqual(updatedCategory);
      expect(categoryService.updateCategory).toHaveBeenCalledWith('category-id-1', {
        ...updateCategoryDto,
        imageFile: mockImageFile,
      });
    });

    it('should throw HttpException when category not found', async () => {
      categoryService.updateCategory.mockRejectedValue(
        new HttpException('Category not found', 404)
      );

      await expect(
        controller.updateCategory('non-existent-id', updateCategoryDto, undefined)
      ).rejects.toThrow(new HttpException('Category not found', 404));
    });

    it('should throw HttpException on update failure', async () => {
      categoryService.updateCategory.mockRejectedValue(
        new HttpException('Failed to update category', 500)
      );

      await expect(
        controller.updateCategory('category-id-1', updateCategoryDto, undefined)
      ).rejects.toThrow(HttpException);
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      categoryService.deleteCategory.mockResolvedValue(mockCategory);

      const result = await controller.deleteCategory('category-id-1');

      expect(result).toEqual(mockCategory);
      expect(categoryService.deleteCategory).toHaveBeenCalledWith('category-id-1');
    });

    it('should throw HttpException when category not found', async () => {
      categoryService.deleteCategory.mockRejectedValue(
        new HttpException('Category not found', 404)
      );

      await expect(controller.deleteCategory('non-existent-id')).rejects.toThrow(
        new HttpException('Category not found', 404)
      );
    });

    it('should throw HttpException on deletion failure', async () => {
      categoryService.deleteCategory.mockRejectedValue(
        new HttpException('Failed to delete category', 500)
      );

      await expect(controller.deleteCategory('category-id-1')).rejects.toThrow(HttpException);
    });
  });
});
