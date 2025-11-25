import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prismaService: PrismaService) {}

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    try {
      // Check if product exists and has stock
      const product = await this.prismaService.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new HttpException('Product not found', 404);
      }

      if (product.stock < quantity) {
        throw new HttpException('Insufficient stock', 400);
      }

      // Check if item already exists in cart
      const existingItem = await this.prismaService.cartItem.findFirst({
        where: {
          userId,
          productId,
        },
      });

      if (existingItem) {
        // Update quantity
        return await this.prismaService.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        });
      } else {
        // Create new cart item
        return await this.prismaService.cartItem.create({
          data: {
            userId,
            productId,
            quantity,
          },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        });
      }
    } catch (error) {
      throw new HttpException(error.message || 'Failed to add to cart', 400);
    }
  }

  async getCartItems(userId: string) {
    try {
      return await this.prismaService.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get cart items', 400);
    }
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number) {
    try {
      if (quantity <= 0) {
        throw new HttpException('Quantity must be greater than 0', 400);
      }

      const cartItem = await this.prismaService.cartItem.findUnique({
        where: { id: cartItemId },
        include: { product: true },
      });

      if (!cartItem) {
        throw new HttpException('Cart item not found', 404);
      }

      if (cartItem.product.stock < quantity) {
        throw new HttpException('Insufficient stock', 400);
      }

      return await this.prismaService.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to update cart item', 400);
    }
  }

  async removeFromCart(cartItemId: string) {
    try {
      return await this.prismaService.cartItem.delete({
        where: { id: cartItemId },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to remove from cart', 400);
    }
  }

  async clearCart(userId: string) {
    try {
      return await this.prismaService.cartItem.deleteMany({
        where: { userId },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to clear cart', 400);
    }
  }

  async getCartTotal(userId: string) {
    try {
      const cartItems = await this.getCartItems(userId);
      const total = cartItems.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);
      return { total, itemCount: cartItems.length };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to calculate cart total', 400);
    }
  }
}
