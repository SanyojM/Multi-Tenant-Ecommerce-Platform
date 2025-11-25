import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Post, Put, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Post()
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('image')) // 'image' is form field key
    async createCategory(
        @Body() body: CreateCategoryDto & { storeId: string },
        @UploadedFile() image?: Express.Multer.File
    ) {
        const { storeId, name } = body
        if (!storeId) throw new BadRequestException('storeId is required')

        return this.categoryService.createCategory(storeId, {
            name,
            imageFile: image,
        })
    }

    @Get(':storeId')
    getAllCategories(@Param('storeId') storeId: string) {
        return this.categoryService.getAllCategories(storeId);
    }

    @Get('id/:id')
    getCategoryById(@Param('id') id: string) {
        return this.categoryService.getCategoryById(id);
    }

    @Put(':id')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('image'))
    async updateCategory(
        @Param('id') id: string,
        @Body() data: UpdateCategoryDto,
        @UploadedFile() image?: Express.Multer.File
    ) {
        return this.categoryService.updateCategory(id, {
            ...data,
            imageFile: image,
        });
    }

    @Delete(':id')
    deleteCategory(@Param('id') id: string) {
        return this.categoryService.deleteCategory(id);
    }
}
