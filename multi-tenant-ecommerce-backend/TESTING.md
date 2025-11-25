# Testing Guide

This document provides a comprehensive guide to testing in the multi-tenant e-commerce backend.

## Test Structure

The testing suite includes:
- **Unit Tests**: Test individual services and utilities in isolation
- **Integration Tests**: Test controllers with mocked dependencies
- **End-to-End (E2E) Tests**: Test complete API flows with real database interactions

## Test Organization

```
src/
├── store/
│   ├── store.service.spec.ts          # Unit tests for StoreService
│   └── store.controller.spec.ts       # Integration tests for StoreController
├── category/
│   ├── category.service.spec.ts       # Unit tests for CategoryService
│   └── category.controller.spec.ts    # Integration tests for CategoryController
└── ...

test/
├── store.e2e-spec.ts                  # E2E tests for Store API
├── category.e2e-spec.ts               # E2E tests for Category API
├── test-setup.ts                      # Test utilities and helpers
├── jest-setup.ts                      # Jest configuration and mocks
└── jest-e2e.json                      # E2E test configuration
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Debug tests
npm run test:debug
```

### End-to-End Tests
```bash
# Run all e2e tests
npm run test:e2e

# Run specific e2e test file
npm run test:e2e -- --testNamePattern="Store API"
```

### Specific Test Files
```bash
# Run specific unit test file
npm run test -- store.service.spec.ts

# Run specific integration test
npm run test -- store.controller.spec.ts

# Run specific e2e test
npm run test:e2e -- --testPathPattern=store.e2e-spec.ts
```

## Test Utilities

### TestDatabaseHelper

The `TestDatabaseHelper` class provides utilities for database operations in tests:

```typescript
import { TestDatabaseHelper } from '../test/test-setup';

// In your test file
let dbHelper: TestDatabaseHelper;

beforeEach(() => {
  dbHelper = new TestDatabaseHelper(prismaService);
  await dbHelper.cleanupDatabase(); // Clean database before each test
});

// Create test data
const store = await dbHelper.createTestStore({ name: 'My Test Store' });
const category = await dbHelper.createTestCategory(store.id, { name: 'Electronics' });
const user = await dbHelper.createTestUser(store.id, { email: 'test@example.com' });
```

### Mock File Creation

For testing file uploads:

```typescript
import { createMockFile } from '../test/test-setup';

const mockImageFile = createMockFile('test-image.jpg', 'image/jpeg', 2048);

// Use in tests
await request(app.getHttpServer())
  .post('/category')
  .attach('image', mockImageFile.buffer, mockImageFile.originalname);
```

### Custom Jest Matchers

The test suite includes custom matchers:

```typescript
// Check if string is valid CUID
expect(store.id).toBeValidCuid();

// Check if string is valid URL
expect(category.imageUrl).toBeValidUrl();

// Check if date is recent (within 5 seconds)
expect(store.createdAt).toBeRecent();
```

## Database Setup for Testing

### Local Testing
Ensure you have a test database configured. The tests will use the `DATABASE_URL` environment variable.

### Test Database Isolation
- Each test file cleans up its data in `beforeEach`/`afterAll` hooks
- The `TestDatabaseHelper.cleanupDatabase()` method removes all test data
- Tests are designed to be independent and can run in any order

### Environment Variables for Testing

The test setup automatically configures mock environment variables:

```typescript
// These are set automatically in jest-setup.ts
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.SUPABASE_API_URL = 'https://mock-supabase-url.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
process.env.VPS_IP = '127.0.0.1';
```

## Mocking Strategy

### Service Mocking
Services are mocked in integration tests to isolate controller logic:

```typescript
const mockStoreService = {
  createStore: jest.fn(),
  getStoreById: jest.fn(),
  // ... other methods
};
```

### External Dependencies
External services like Supabase are mocked globally in `jest-setup.ts`:

```typescript
// Supabase operations are mocked to return predictable values
uploadCategoryImage: jest.fn().mockResolvedValue('https://mock-url.jpg')
```

## Test Coverage

### What's Tested

**Store API:**
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Domain verification and setting
- ✅ Input validation
- ✅ Error handling
- ✅ Database constraints

**Category API:**
- ✅ CRUD operations with file upload support
- ✅ Image upload and deletion
- ✅ Store association validation
- ✅ Input validation
- ✅ Error handling

### Coverage Reports
```bash
# Generate and view coverage report
npm run test:cov

# Coverage reports are generated in ./coverage/
open coverage/lcov-report/index.html
```

## Testing Best Practices

### 1. Test Naming
Use descriptive test names that explain the scenario:

```typescript
// Good
it('should create category with image when valid file is provided')

// Bad  
it('should create category')
```

### 2. Arrange-Act-Assert Pattern
Structure tests clearly:

```typescript
it('should update store successfully', async () => {
  // Arrange
  const store = await createTestStore();
  const updateData = { name: 'Updated Name' };

  // Act
  const result = await storeService.updateStore(store.id, updateData);

  // Assert
  expect(result.name).toBe('Updated Name');
});
```

### 3. Test Independence
Each test should be independent and not rely on other tests:

```typescript
beforeEach(async () => {
  await dbHelper.cleanupDatabase(); // Start fresh
});
```

### 4. Mock External Services
Always mock external dependencies:

```typescript
// Mock Supabase service
jest.mock('../src/supabase/supabase.service');
```

### 5. Test Error Scenarios
Include negative test cases:

```typescript
it('should throw error when store not found', async () => {
  await expect(storeService.getStoreById('invalid-id')).rejects.toThrow();
});
```

## Debugging Tests

### Running Tests with Debug Output
```bash
# Show console output during tests
TEST_VERBOSE=true npm run test

# Debug specific test with Node inspector
npm run test:debug -- --testNamePattern="specific test name"
```

### Common Issues

1. **Database Connection**: Ensure test database is running and accessible
2. **Port Conflicts**: E2E tests start the application, ensure no port conflicts
3. **Async Issues**: Use proper async/await in test setup and teardown
4. **Mock Conflicts**: Clear mocks between tests with `jest.clearAllMocks()`

## Adding New Tests

### For New Controllers
1. Create unit tests for the service (`service.spec.ts`)
2. Create integration tests for the controller (`controller.spec.ts`)
3. Create E2E tests for the API endpoints (`api-name.e2e-spec.ts`)

### For New Services
1. Mock all dependencies
2. Test all public methods
3. Include error scenarios
4. Test edge cases

### Example Test Template
```typescript
describe('NewService', () => {
  let service: NewService;
  let dependency: jest.Mocked<Dependency>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NewService,
        { provide: Dependency, useValue: mockDependency }
      ],
    }).compile();

    service = module.get<NewService>(NewService);
    dependency = module.get(Dependency);
  });

  describe('method', () => {
    it('should handle success case', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Test implementation  
    });
  });
});
```

## Continuous Integration

Tests should run in CI/CD pipeline:

```bash
# In CI environment
npm ci                    # Install dependencies
npm run build            # Build the application
npm run test:cov         # Run unit tests with coverage
npm run test:e2e         # Run e2e tests
```

The test suite is designed to be reliable and fast, making it suitable for continuous integration workflows.
