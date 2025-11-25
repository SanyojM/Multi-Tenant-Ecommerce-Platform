import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProductService {
    constructor(
        private prismaService: PrismaService,
        private supabaseService: SupabaseService
    ) {}

    async createProduct(
        storeId: string, 
        data: Prisma.ProductCreateInput & { 
            imageFiles?: Express.Multer.File[];
            graphicFiles?: Express.Multer.File[];
            variantIds?: string[];
        }
    ) {
        try {
            // Validate store exists
            const store = await this.prismaService.store.findUnique({ 
                where: { id: storeId } 
            });
            if (!store) {
                throw new HttpException('Store not found', 404);
            }

            // Validate category exists and belongs to store
            const category = await this.prismaService.category.findUnique({
                where: { id: data.category.connect.id }
            });
            if (!category) {
                throw new HttpException('Category not found', 404);
            }
            if (category.storeId !== storeId) {
                throw new HttpException('Category does not belong to the specified store', 400);
            }

            // Handle image uploads
            let imageGallery: string[] = [];
            if (data.imageFiles && data.imageFiles.length > 0) {
                console.log(`Uploading ${data.imageFiles.length} product images`);
                for (const file of data.imageFiles) {
                    const filename = `product-${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
                    const imageUrl = await this.supabaseService.uploadProductImage(file.buffer, filename);
                    imageGallery.push(imageUrl);
                }
            }

            // Handle graphic uploads
            let graphics: string[] = [];
            if (data.graphicFiles && data.graphicFiles.length > 0) {
                console.log(`Uploading ${data.graphicFiles.length} product graphics`);
                for (const file of data.graphicFiles) {
                    const filename = `graphic-${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
                    const graphicUrl = await this.supabaseService.uploadProductGraphic(file.buffer, filename);
                    graphics.push(graphicUrl);
                }
            }

            // Remove custom fields from data
            const { imageFiles, graphicFiles, variantIds, ...productData } = data;

            // Create product data with proper Prisma types
            const createData: Prisma.ProductCreateInput = {
                ...productData,
                imageGallery,
                graphics,
                store: { connect: { id: storeId } },
                category: { connect: { id: data.category.connect.id } },
            };

            // Handle variants if provided
            if (variantIds && variantIds.length > 0) {
                // Validate all variants exist
                const variants = await this.prismaService.variant.findMany({
                    where: { id: { in: variantIds } }
                });
                if (variants.length !== variantIds.length) {
                    throw new HttpException('One or more variants not found', 404);
                }
                createData.variants = { connect: variantIds.map(id => ({ id })) };
            }

            const product = await this.prismaService.product.create({
                data: createData,
                include: {
                    category: true,
                    store: true,
                    variants: {
                        include: {
                            options: true
                        }
                    }
                }
            });

            return product;
        } catch (error) {
            throw new HttpException(`Failed to create product: ${error.message}`, error.status || 500);
        }
    }

    async getAllProducts(storeId: string) {
        try {
            return await this.prismaService.product.findMany({
                where: { storeId },
                include: {
                    category: true,
                    variants: {
                        include: {
                            options: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            throw new HttpException(`Failed to get products: ${error.message}`, 500);
        }
    }

    async getProductsByCategory(categoryId: string) {
        try {
            return await this.prismaService.product.findMany({
                where: { categoryId },
                include: {
                    category: true,
                    variants: {
                        include: {
                            options: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            throw new HttpException(`Failed to get products by category: ${error.message}`, 500);
        }
    }

    async getProductById(id: string) {
        try {
            const product = await this.prismaService.product.findUnique({
                where: { id },
                include: {
                    category: true,
                    store: true,
                    variants: {
                        include: {
                            options: true
                        }
                    }
                }
            });

            if (!product) {
                throw new HttpException('Product not found', 404);
            }

            return product;
        } catch (error) {
            throw new HttpException(`Failed to get product: ${error.message}`, error.status || 500);
        }
    }

    async updateProduct(
        id: string, 
        data: Prisma.ProductUpdateInput & {
            imageFiles?: Express.Multer.File[];
            graphicFiles?: Express.Multer.File[];
            removeImages?: string[];
            removeGraphics?: string[];
            variantIds?: string[];
        }
    ) {
        try {
            console.log('Updating product with ID:', id);

            // Check if product exists
            const existingProduct = await this.prismaService.product.findUnique({
                where: { id },
                include: { variants: true }
            });
            if (!existingProduct) {
                throw new HttpException('Product not found', 404);
            }

            // Validate category if being updated
            if (data.category && typeof data.category === 'object' && 'connect' in data.category) {
                const categoryId = data.category.connect.id;
                const category = await this.prismaService.category.findUnique({
                    where: { id: categoryId }
                });
                if (!category) {
                    throw new HttpException('Category not found', 404);
                }
                if (category.storeId !== existingProduct.storeId) {
                    throw new HttpException('Category does not belong to the same store', 400);
                }
            }

            let currentImageGallery = [...existingProduct.imageGallery];
            let currentGraphics = [...existingProduct.graphics];

            // Handle image removals
            if (data.removeImages && data.removeImages.length > 0) {
                console.log(`Removing ${data.removeImages.length} product images`);
                for (const imageUrl of data.removeImages) {
                    await this.supabaseService.deleteProductImage(imageUrl);
                }
                currentImageGallery = currentImageGallery.filter(
                    url => !data.removeImages.includes(url)
                );
            }

            // Handle graphic removals
            if (data.removeGraphics && data.removeGraphics.length > 0) {
                console.log(`Removing ${data.removeGraphics.length} product graphics`);
                for (const graphicUrl of data.removeGraphics) {
                    await this.supabaseService.deleteProductGraphic(graphicUrl);
                }
                currentGraphics = currentGraphics.filter(
                    url => !data.removeGraphics.includes(url)
                );
            }

            // Handle new image uploads
            if (data.imageFiles && data.imageFiles.length > 0) {
                console.log(`Uploading ${data.imageFiles.length} new product images`);
                for (const file of data.imageFiles) {
                    const filename = `product-${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
                    const imageUrl = await this.supabaseService.uploadProductImage(file.buffer, filename);
                    currentImageGallery.push(imageUrl);
                }
            }

            // Handle new graphic uploads
            if (data.graphicFiles && data.graphicFiles.length > 0) {
                console.log(`Uploading ${data.graphicFiles.length} new product graphics`);
                for (const file of data.graphicFiles) {
                    const filename = `graphic-${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
                    const graphicUrl = await this.supabaseService.uploadProductGraphic(file.buffer, filename);
                    currentGraphics.push(graphicUrl);
                }
            }

            // Remove custom fields from data
            const { imageFiles, graphicFiles, removeImages, removeGraphics, variantIds, ...updateData } = data;

            // Prepare update data with proper Prisma types
            const prismaUpdateData: Prisma.ProductUpdateInput = {
                ...updateData,
                imageGallery: { set: currentImageGallery },
                graphics: { set: currentGraphics },
            };

            // Handle variants update
            if (variantIds !== undefined) {
                if (variantIds.length > 0) {
                    // Validate all variants exist
                    const variants = await this.prismaService.variant.findMany({
                        where: { id: { in: variantIds } }
                    });
                    if (variants.length !== variantIds.length) {
                        throw new HttpException('One or more variants not found', 404);
                    }
                    prismaUpdateData.variants = {
                        set: variantIds.map(id => ({ id }))
                    };
                } else {
                    // Remove all variants
                    prismaUpdateData.variants = { set: [] };
                }
            }

            const updatedProduct = await this.prismaService.product.update({
                where: { id },
                data: prismaUpdateData,
                include: {
                    category: true,
                    store: true,
                    variants: {
                        include: {
                            options: true
                        }
                    }
                }
            });

            console.log('Product updated successfully:', updatedProduct.id);
            return updatedProduct;
        } catch (error) {
            console.error('Error in updateProduct:', error);
            throw new HttpException(`Failed to update product: ${error.message}`, error.status || 500);
        }
    }

    async deleteProduct(id: string) {
        try {
            console.log('Deleting product with ID:', id);

            // Get product with all its data
            const existingProduct = await this.prismaService.product.findUnique({
                where: { id }
            });
            if (!existingProduct) {
                throw new HttpException('Product not found', 404);
            }

            console.log('Product found:', existingProduct.name);

            // Delete all images from storage
            if (existingProduct.imageGallery && existingProduct.imageGallery.length > 0) {
                console.log(`Deleting ${existingProduct.imageGallery.length} product images`);
                for (const imageUrl of existingProduct.imageGallery) {
                    await this.supabaseService.deleteProductImage(imageUrl);
                }
            }

            // Delete all graphics from storage
            if (existingProduct.graphics && existingProduct.graphics.length > 0) {
                console.log(`Deleting ${existingProduct.graphics.length} product graphics`);
                for (const graphicUrl of existingProduct.graphics) {
                    await this.supabaseService.deleteProductGraphic(graphicUrl);
                }
            }

            // Delete the product from database
            const deletedProduct = await this.prismaService.product.delete({ 
                where: { id },
                include: {
                    category: true,
                    store: true
                }
            });
            console.log('Product deleted successfully:', deletedProduct.id);

            return deletedProduct;
        } catch (error) {
            console.error('Error in deleteProduct:', error);
            throw new HttpException(`Failed to delete product: ${error.message}`, error.status || 500);
        }
    }

    async updateStock(id: string, stock: number) {
        try {
            const updatedProduct = await this.prismaService.product.update({
                where: { id },
                data: { stock },
                include: {
                    category: true,
                    store: true
                }
            });

            return updatedProduct;
        } catch (error) {
            throw new HttpException(`Failed to update stock: ${error.message}`, 500);
        }
    }

    async searchProducts(storeId: string, query: string) {
        try {
            return await this.prismaService.product.findMany({
                where: {
                    storeId,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ]
                },
                include: {
                    category: true,
                    variants: {
                        include: {
                            options: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            throw new HttpException(`Failed to search products: ${error.message}`, 500);
        }
    }
}
