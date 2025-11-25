import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Store API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    prismaService = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prismaService.store.deleteMany();
  });

  afterAll(async () => {
    // Clean up the database after all tests
    await prismaService.store.deleteMany();
    await app.close();
  });

  describe('/store (POST)', () => {
    it('should create a new store', async () => {
      const createStoreDto = {
        name: 'Test Store',
        description: 'A test store description',
        logoUrl: 'https://example.com/logo.png',
        domain: 'teststore.com',
      };

      const response = await request(app.getHttpServer())
        .post('/store')
        .send(createStoreDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createStoreDto.name,
        description: createStoreDto.description,
        logoUrl: createStoreDto.logoUrl,
        domain: createStoreDto.domain,
        isActive: true,
        domainStatus: 'PENDING',
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should fail to create store without required name', async () => {
      const invalidDto = {
        description: 'A test store description',
      };

      await request(app.getHttpServer())
        .post('/store')
        .send(invalidDto)
        .expect(400);
    });

    it('should create store with only required fields', async () => {
      const minimalDto = {
        name: 'Minimal Store',
      };

      const response = await request(app.getHttpServer())
        .post('/store')
        .send(minimalDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: minimalDto.name,
        isActive: true,
        domainStatus: 'PENDING',
      });
      expect(response.body.description).toBeNull();
      expect(response.body.logoUrl).toBeNull();
      expect(response.body.domain).toBeNull();
    });
  });

  describe('/store (GET)', () => {
    it('should return all stores', async () => {
      // Create test stores
      const store1 = await prismaService.store.create({
        data: {
          name: 'Store 1',
          description: 'First test store',
        },
      });

      const store2 = await prismaService.store.create({
        data: {
          name: 'Store 2',
          description: 'Second test store',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/store')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: store1.id }),
          expect.objectContaining({ id: store2.id }),
        ])
      );
    });

    it('should return empty array when no stores exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/store')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('/store/:id (GET)', () => {
    it('should return store by id', async () => {
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store',
          description: 'Test Description',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/store/${store.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: store.id,
        name: store.name,
        description: store.description,
      });
    });

    it('should return null for non-existent store', async () => {
      const response = await request(app.getHttpServer())
        .get('/store/non-existent-id')
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('/store/domain/:domain (GET)', () => {
    it('should return store by domain', async () => {
      const store = await prismaService.store.create({
        data: {
          name: 'Domain Store',
          domain: 'domainstore.com',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/store/domain/${store.domain}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: store.id,
        name: store.name,
        domain: store.domain,
      });
    });

    it('should return null for non-existent domain', async () => {
      const response = await request(app.getHttpServer())
        .get('/store/domain/non-existent-domain.com')
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('/store/:id (PUT)', () => {
    it('should update store successfully', async () => {
      const store = await prismaService.store.create({
        data: {
          name: 'Original Store',
          description: 'Original Description',
        },
      });

      const updateDto = {
        name: 'Updated Store',
        description: 'Updated Description',
      };

      const response = await request(app.getHttpServer())
        .put(`/store/${store.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: store.id,
        name: updateDto.name,
        description: updateDto.description,
      });
      expect(new Date(response.body.updatedAt)).toBeInstanceOf(Date);
    });

    it('should fail to update non-existent store', async () => {
      const updateDto = {
        name: 'Updated Store',
      };

      await request(app.getHttpServer())
        .put('/store/non-existent-id')
        .send(updateDto)
        .expect(400);
    });
  });

  describe('/store/set-domain/:id (POST)', () => {
    it('should set domain for valid format', async () => {
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store',
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/store/set-domain/${store.id}`)
        .send({ domain: 'example.com' })
        .expect(201);

      expect(response.body).toMatchObject({
        id: store.id,
        domain: 'example.com',
        domainStatus: 'PENDING',
      });
    });

    it('should fail with invalid domain format', async () => {
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store',
        },
      });

      await request(app.getHttpServer())
        .post(`/store/set-domain/${store.id}`)
        .send({ domain: 'invalid-domain' })
        .expect(400);
    });

    it('should fail for non-existent store', async () => {
      await request(app.getHttpServer())
        .post('/store/set-domain/non-existent-id')
        .send({ domain: 'example.com' })
        .expect(400);
    });
  });

  describe('/store/:id (DELETE)', () => {
    it('should delete store successfully', async () => {
      const store = await prismaService.store.create({
        data: {
          name: 'Store to Delete',
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/store/${store.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: store.id,
        name: store.name,
      });

      // Verify store is deleted
      const deletedStore = await prismaService.store.findUnique({
        where: { id: store.id },
      });
      expect(deletedStore).toBeNull();
    });

    it('should fail to delete non-existent store', async () => {
      await request(app.getHttpServer())
        .delete('/store/non-existent-id')
        .expect(400);
    });
  });

  describe('/store/verify-domain (POST)', () => {
    it('should handle domain verification attempt', async () => {
      // Note: This test will likely fail in a test environment since 
      // the domain won't actually point to the test server
      // This is mainly to test the endpoint structure
      await request(app.getHttpServer())
        .post('/store/verify-domain')
        .send({ domain: 'example.com' })
        .expect(400); // Expected to fail in test environment
    });
  });
});
