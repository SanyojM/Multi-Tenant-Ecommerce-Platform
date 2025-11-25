# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Project Setup
```bash
npm install                    # Install dependencies
npx prisma generate           # Generate Prisma client
npx prisma db push            # Push schema to database
```

### Development Server
```bash
npm run start:dev             # Start in watch mode (recommended for development)
npm run start                 # Start normally
npm run start:debug           # Start with debugging enabled
npm run start:prod            # Production mode
```

### Database Management
```bash
npx prisma migrate dev        # Create and apply new migration
npx prisma migrate reset      # Reset database and apply all migrations
npx prisma studio             # Open database GUI
npx prisma db seed            # Run database seeds
```

### Testing
```bash
npm run test                  # Run unit tests
npm run test:watch            # Run tests in watch mode
npm run test:cov              # Run tests with coverage report
npm run test:e2e              # Run end-to-end tests
npm run test:debug            # Debug tests
```

### Code Quality
```bash
npm run lint                  # Run ESLint and auto-fix issues
npm run format                # Format code with Prettier
npm run build                 # Build the project
```

### Supabase Local Development
```bash
supabase start                # Start local Supabase stack
supabase stop                 # Stop local Supabase stack
supabase status               # Check status of local services
supabase db reset             # Reset local database
```

## Architecture Overview

### Multi-Tenant E-commerce Platform
This is a **NestJS-based multi-tenant e-commerce backend** using:
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Supabase Storage for images
- **Authentication**: Custom auth system
- **Architecture**: Modular NestJS with domain-driven design

### Core Domain Modules
- **Store**: Multi-tenant store management with domain support
- **Auth**: Authentication and authorization
- **User**: User management with store association
- **Product**: Product catalog with variants and categories
- **Category**: Product categorization with image support
- **Cart**: Shopping cart functionality
- **Order**: Order processing and management
- **Address**: User address management

### Key Architectural Patterns

#### Multi-Tenancy
- Each store operates as a separate tenant
- Users are associated with specific stores via `storeId`
- Domain-based routing supported with `domain` field in stores
- Store admins have separate management access

#### Database Schema Structure
- **Store-Centric**: All major entities are scoped by `storeId`
- **Hierarchical Products**: Products → Categories → Stores
- **Complex Variants**: Support for product variants with multiple options
- **Order Management**: Full order lifecycle with payments and addresses
- **File Storage Integration**: Image URLs stored in database, files in Supabase

#### Service Layer Architecture
- Each module follows NestJS standard: Controller → Service → Database
- Prisma service handles all database operations
- Supabase service manages file uploads for categories and stores
- DTOs for request/response validation using class-validator

### File Storage Strategy
- **Supabase Storage** with bucket: `softricity-bucket`
- **Category Images**: `category-images/` folder
- **Store Images**: `store-images/` folder  
- **Public URLs**: Generated and stored in database
- **Error Handling**: Graceful fallback for missing files

### Environment Configuration
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_API_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for storage operations
- `PORT`: Server port (defaults to 3000)

### Development Setup Notes
- **CORS**: Currently configured for `http://localhost:3001`
- **Local Supabase**: Uses ports 64321-64329 range
- **Database Migrations**: Located in `prisma/migrations/`
- **Seed Data**: Configuration in `supabase/seed.sql`

### Testing Structure
- **Unit Tests**: Individual service/controller testing with Jest
- **E2E Tests**: Full API endpoint testing
- **Coverage**: Available via `npm run test:cov`
- **Debug Mode**: Node inspector available for test debugging

### Common Development Patterns
- **Error Handling**: Services throw errors, controllers handle HTTP responses
- **File Upload**: Use multer for file handling, Supabase for storage
- **Validation**: DTOs with class-validator decorators
- **Database Queries**: Prisma ORM with generated client
- **Module Imports**: PrismaModule imported by all feature modules
