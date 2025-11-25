import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Category API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testStoreId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    prismaService = app.get<PrismaService>(PrismaService);
    
    await app.init();

    // Create a test store for category tests
    const testStore = await prismaService.store.create({
      data: {
        name: 'Test Store for Categories',
        description: 'Store used for testing categories',
      },
    });
    testStoreId = testStore.id;
  });

  beforeEach(async () => {
    // Clean up categories before each test
    await prismaService.category.deleteMany();
  });

  afterAll(async () => {
    // Clean up all test data
    await prismaService.category.deleteMany();
    await prismaService.store.deleteMany();
    await app.close();
  });

  describe('/category (POST)', () => {
    it('should create category without image', async () => {
      const response = await request(app.getHttpServer())
        .post('/category')
        .field('name', 'Electronics')
        .field('storeId', testStoreId)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Electronics',
        storeId: testStoreId,
        imageUrl: null,
      });
      expect(response.body.id).toBeDefined();
    });

    it('should create category with image', async () => {
      // Create a simple test image buffer
      const testImageBuffer = Buffer.from('fake-image-data');

      const response = await request(app.getHttpServer())
        .post('/category')
        .field('name', 'Clothing')
        .field('storeId', testStoreId)
        .attach('image', testImageBuffer, 'test-image.jpg')
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Clothing',
        storeId: testStoreId,
      });
      expect(response.body.imageUrl).toBeDefined();
      expect(response.body.imageUrl).toContain('category-');
    });

    it('should fail to create category without storeId', async () => {
      await request(app.getHttpServer())
        .post('/category')
        .field('name', 'Electronics')
        .expect(400);
    });

    it('should fail to create category without name', async () => {
      await request(app.getHttpServer())
        .post('/category')
        .field('storeId', testStoreId)
        .expect(400);
    });

    it('should fail to create category with invalid storeId', async () => {
      await request(app.getHttpServer())
        .post('/category')
        .field('name', 'Electronics')
        .field('storeId', 'invalid-store-id')
        .expect(500); // Service will throw error for non-existent store
    });
  });

  describe('/category/:storeId (GET)', () => {
    it('should return all categories for a store', async () => {
      // Create test categories
      const category1 = await prismaService.category.create({
        data: {
          name: 'Electronics',
          storeId: testStoreId,
        },
      });

      const category2 = await prismaService.category.create({
        data: {
          name: 'Clothing',
          storeId: testStoreId,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/category/${testStoreId}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: category1.id, name: 'Electronics' }),
          expect.objectContaining({ id: category2.id, name: 'Clothing' }),
        ])
      );
    });

    it('should return empty array when no categories exist for store', async () => {
      const response = await request(app.getHttpServer())
        .get(`/category/${testStoreId}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should return empty array for non-existent store', async () => {
      const response = await request(app.getHttpServer())
        .get('/category/non-existent-store-id')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('/category/id/:id (GET)', () => {
    it('should return category by id', async () => {
      const category = await prismaService.category.create({
        data: {
          name: 'Electronics',
          storeId: testStoreId,
          imageUrl: 'https://example.com/image.jpg',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/category/id/${category.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: category.id,
        name: category.name,
        storeId: category.storeId,
        imageUrl: category.imageUrl,
      });
    });

    it('should return null for non-existent category', async () => {
      const response = await request(app.getHttpServer())
        .get('/category/id/non-existent-category-id')
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('/category/:id (PUT)', () => {
    it('should update category without changing image', async () => {
      const category = await prismaService.category.create({
        data: {
          name: 'Electronics',
          storeId: testStoreId,
          imageUrl: 'https://example.com/original-image.jpg',
        },
      });

      const response = await request(app.getHttpServer())
        .put(`/category/${category.id}`)
        .field('name', 'Updated Electronics')
        .expect(200);

      expect(response.body).toMatchObject({
        id: category.id,
        name: 'Updated Electronics',
        storeId: testStoreId,
        imageUrl: 'https://example.com/original-image.jpg',
      });
    });

    it('should update category with new image', async () => {
      const category = await prismaService.category.create({
        data: {
          name: 'Electronics',
          storeId: testStoreId,
        },
      });

      const testImageBuffer = Buffer.from('new-fake-image-data');

      const response = await request(app.getHttpServer())
        .put(`/category/${category.id}`)
        .field('name', 'Updated Electronics')
        .attach('image', testImageBuffer, 'new-test-image.jpg')
        .expect(200);

      expect(response.body).toMatchObject({
        id: category.id,
        name: 'Updated Electronics',
        storeId: testStoreId,
      });
      expect(response.body.imageUrl).toBeDefined();
      expect(response.body.imageUrl).toContain('category-');
    });

    it('should fail to update non-existent category', async () => {
      await request(app.getHttpServer())
        .put('/category/non-existent-category-id')
        .field('name', 'Updated Name')
        .expect(500); // Service throws HttpException
    });
  });

  describe('/category/:id (DELETE)', () => {
    it('should delete category without image', async () => {
      const category = await prismaService.category.create({
        data: {
          name: 'Electronics',
          storeId: testStoreId,
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/category/${category.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: category.id,
        name: category.name,
        storeId: testStoreId,
      });

      // Verify category is deleted
      const deletedCategory = await prismaService.category.findUnique({
        where: { id: category.id },
      });
      expect(deletedCategory).toBeNull();
    });

    it('should delete category with image', async () => {
      const category = await prismaService.category.create({
        data: {
          name: 'Electronics',
          storeId: testStoreId,
          imageUrl: 'https://example.com/image-to-delete.jpg',
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/category/${category.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: category.id,
        name: category.name,
        storeId: testStoreId,
        imageUrl: 'https://example.com/image-to-delete.jpg',
      });

      // Verify category is deleted
      const deletedCategory = await prismaService.category.findUnique({
        where: { id: category.id },
      });
      expect(deletedCategory).toBeNull();
    });

    it('should fail to delete non-existent category', async () => {
      await request(app.getHttpServer())
        .delete('/category/non-existent-category-id')
        .expect(500); // Service throws HttpException
    });
  });

  describe('File upload validation', () => {
    it('should handle multiple file types', async () => {
      const testImageBuffer = Buffer.from('fake-png-data');

      const response = await request(app.getHttpServer())
        .post('/category')
        .field('name', 'PNG Category')
        .field('storeId', testStoreId)
        .attach('image', testImageBuffer, 'test-image.png')
        .expect(201);

      expect(response.body.imageUrl).toBeDefined();
    });

    it('should handle large form data', async () => {
      const largeImageBuffer = Buffer.alloc(1024 * 50, 'a'); // 50KB buffer

      const response = await request(app.getHttpServer())
        .post('/category')
        .field('name', 'Large Image Category')
        .field('storeId', testStoreId)
        .attach('image', largeImageBuffer, 'large-test-image.jpg')
        .expect(201);

      expect(response.body.imageUrl).toBeDefined();
    });
  });
});
