import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CategoryService {
    constructor(private prismaService: PrismaService, private supabaseService: SupabaseService) {}

    async createCategory(storeId: string, data: Prisma.CategoryCreateWithoutStoreInput & { imageFile?: Express.Multer.File }) {
        try {
            const store = await this.prismaService.store.findUnique({ where: { id: storeId } })
            if (!store) {
        throw new HttpException('Store not found', 404)
        }

        let imageUrl: string | undefined = undefined

        // 🖼️ Upload image if provided
        if (data.imageFile) {
        const filename = `category-${Date.now()}-${data.imageFile.originalname}`
        imageUrl = await this.supabaseService.uploadCategoryImage(data.imageFile.buffer, filename)
        }

        return this.prismaService.category.create({
        data: {
            name: data.name,
            storeId,
            imageUrl: imageUrl,
        },
        })
    } catch (error) {
        throw new HttpException(`Failed to create category: ${error.message}`, 500)
    }
    }


    getAllCategories(storeId: string) {
        return this.prismaService.category.findMany({ where: { storeId } });
    }

    getCategoryById(id: string) {
        try {
            return this.prismaService.category.findUnique({ where: { id } });
        } catch (error) {
            throw new HttpException(`Failed to get category by id: ${error.message}`, 500);
        }
    }

    async updateCategory(
        id: string,
        data: Prisma.CategoryUpdateInput & { imageFile?: Express.Multer.File }
    ) {
        try {
            console.log('Updating category with ID:', id);
            const existingCategory = await this.prismaService.category.findUnique({ where: { id } });
            if (!existingCategory) {
                throw new HttpException('Category not found', 404);
            }

            console.log('Existing category found:', existingCategory.name);
            let imageUrl: string | undefined = undefined;

            // 🖼️ Handle image update
            if (data.imageFile) {
                console.log('Processing image file:', data.imageFile.originalname);
                
                // Delete previous image if exists
                if (existingCategory.imageUrl) {
                    console.log('Deleting existing image:', existingCategory.imageUrl);
                    await this.supabaseService.deleteCategoryImage(existingCategory.imageUrl);
                }
                
                const filename = `category-${Date.now()}-${data.imageFile.originalname}`;
                console.log('Uploading new image with filename:', filename);
                imageUrl = await this.supabaseService.uploadCategoryImage(data.imageFile.buffer, filename);
                console.log('New image uploaded successfully:', imageUrl);
            }

            // Remove imageFile from data before database update
            const { imageFile, ...updateData } = data;

            const updatedCategory = await this.prismaService.category.update({
                where: { id },
                data: {
                    ...updateData,
                    imageUrl: imageUrl !== undefined ? imageUrl : existingCategory.imageUrl,
                },
            });

            console.log('Category updated successfully:', updatedCategory.id);
            return updatedCategory;
        } catch (error) {
            console.error('Error in updateCategory:', error);
            throw new HttpException(`Failed to update category: ${error.message}`, 500);
        }
    }

    async deleteCategory(id: string) {
        try {
            console.log('Deleting category with ID:', id);
            
            // First get the category to check if it has an image
            const existingCategory = await this.prismaService.category.findUnique({ where: { id } });
            if (!existingCategory) {
                throw new HttpException('Category not found', 404);
            }

            console.log('Category found:', existingCategory.name);
            
            // Delete the image if it exists
            if (existingCategory.imageUrl) {
                console.log('Deleting category image:', existingCategory.imageUrl);
                await this.supabaseService.deleteCategoryImage(existingCategory.imageUrl);
            }

            const products = await this.prismaService.product.findMany({ where: { categoryId: id } });
            for (const product of products) {
                // Delete all images from storage
                if (product.imageGallery && product.imageGallery.length > 0) {
                    console.log(`Deleting ${product.imageGallery.length} product images`);
                    for (const imageUrl of product.imageGallery) {
                        await this.supabaseService.deleteProductImage(imageUrl);
                    }
                }
                // Delete all graphics from storage
                if (product.graphics && product.graphics.length > 0) {
                    console.log(`Deleting ${product.graphics.length} product graphics`);
                    for (const graphicUrl of product.graphics) {
                        await this.supabaseService.deleteProductGraphic(graphicUrl);
                    }
                }
                // Delete product record
                await this.prismaService.product.delete({ where: { id: product.id } });
            }

            // Delete the category from database
            const deletedCategory = await this.prismaService.category.delete({ where: { id } });
            console.log('Category deleted successfully:', deletedCategory.id);
            
            return deletedCategory;
        } catch (error) {
            console.error('Error in deleteCategory:', error);
            throw new HttpException(`Failed to delete category: ${error.message}`, 500);
        }
    }
}
