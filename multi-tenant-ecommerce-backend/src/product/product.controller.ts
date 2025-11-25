import { 
    BadRequestException, 
    Body, 
    Controller, 
    Delete, 
    Get, 
    Param, 
    Patch,
    Post, 
    Put, 
    Query,
    UploadedFiles, 
    UseInterceptors, 
    UsePipes, 
    ValidationPipe 
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
    constructor(private productService: ProductService) {}

    @Post()
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'images', maxCount: 20 },
        { name: 'graphics', maxCount: 20 }
    ]))
    async createProduct(
        @Body() body: CreateProductDto,
        @UploadedFiles() files: {
            images?: Express.Multer.File[];
            graphics?: Express.Multer.File[];
        }
    ) {
        const { storeId, categoryId, name, description, price, stock, specs, variantIds } = body;
        
        if (!storeId) throw new BadRequestException('storeId is required');
        if (!categoryId) throw new BadRequestException('categoryId is required');
        if (!name) throw new BadRequestException('name is required');
        if (price === undefined) throw new BadRequestException('price is required');
        if (stock === undefined) throw new BadRequestException('stock is required');

        const imageFiles = files?.images || [];
        const graphicFiles = files?.graphics || [];

        return this.productService.createProduct(storeId, {
            name,
            description,
            price: parseFloat(price as any),
            stock: parseInt(stock as any),
            store: { connect: { id: storeId } },
            category: { connect: { id: categoryId } },
            specs,
            variantIds,
            imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
            graphicFiles: graphicFiles.length > 0 ? graphicFiles : undefined,
        });
    }

    @Get('store/:storeId')
    getAllProducts(@Param('storeId') storeId: string) {
        return this.productService.getAllProducts(storeId);
    }

    @Get('category/:categoryId')
    getProductsByCategory(@Param('categoryId') categoryId: string) {
        return this.productService.getProductsByCategory(categoryId);
    }

    @Get('search/:storeId')
    searchProducts(
        @Param('storeId') storeId: string,
        @Query('q') query: string
    ) {
        if (!query) {
            throw new BadRequestException('Search query is required');
        }
        return this.productService.searchProducts(storeId, query);
    }

    @Get(':id')
    getProductById(@Param('id') id: string) {
        return this.productService.getProductById(id);
    }

    @Put(':id')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'images', maxCount: 20 },
        { name: 'graphics', maxCount: 20 }
    ]))
    async updateProduct(
        @Param('id') id: string,
        @Body() data: UpdateProductDto,
        @UploadedFiles() files?: {
            images?: Express.Multer.File[];
            graphics?: Express.Multer.File[];
        }
    ) {
        // Separate image files from graphic files
        const imageFiles = files?.images || [];
        const graphicFiles = files?.graphics || [];
        const { categoryId, price, stock, ...rest } = data;

        return this.productService.updateProduct(id, {
            ...rest,
            ...(categoryId && { category: { connect: { id: categoryId } } }),
            imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
            graphicFiles: graphicFiles.length > 0 ? graphicFiles : undefined,
            price: Number(price),
            stock: stock !== undefined ? Number(stock) : undefined,
        });
    }

    @Patch(':id/stock')
    @UsePipes(ValidationPipe)
    async updateStock(
        @Param('id') id: string,
        @Body() body: { stock: number }
    ) {
        if (body.stock === undefined || body.stock < 0) {
            throw new BadRequestException('Valid stock value is required');
        }
        return this.productService.updateStock(id, body.stock);
    }

    @Delete(':id')
    deleteProduct(@Param('id') id: string) {
        return this.productService.deleteProduct(id);
    }
}
