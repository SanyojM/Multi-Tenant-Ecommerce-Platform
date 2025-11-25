import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}

  async createOrder(
    userId: string,
    storeId: string,
    items: Array<{ productId: string; quantity: number; price: number }>,
    addressId?: string,
  ) {
    try {
      // Validate stock availability
      for (const item of items) {
        const product = await this.prismaService.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new HttpException(`Product ${item.productId} not found`, 404);
        }

        if (product.stock < item.quantity) {
          throw new HttpException(
            `Insufficient stock for product ${product.name}`,
            400,
          );
        }
      }

      // Calculate total amount
      const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Create order with items
      const order = await this.prismaService.order.create({
        data: {
          userId,
          storeId,
          totalAmount,
          addressId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
          address: true,
        },
      });

      // Update product stock
      for (const item of items) {
        await this.prismaService.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear user's cart
      await this.prismaService.cartItem.deleteMany({
        where: { userId },
      });

      return order;
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create order', 400);
    }
  }

  async getOrderById(id: string) {
    try {
      return await this.prismaService.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
          address: true,
          payment: true,
        },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get order', 400);
    }
  }

  async getUserOrders(userId: string) {
    try {
      return await this.prismaService.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payment: true,
          address: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get user orders', 400);
    }
  }

  async getStoreOrders(storeId: string) {
    try {
      return await this.prismaService.order.findMany({
        where: { storeId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
          payment: true,
          address: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get store orders', 400);
    }
  }

  async cancelOrder(orderId: string) {
    try {
      const order = await this.prismaService.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          payment: true,
        },
      });

      if (!order) {
        throw new HttpException('Order not found', 404);
      }

      // Restore product stock
      for (const item of order.items) {
        await this.prismaService.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update payment status if exists
      if (order.payment) {
        await this.prismaService.payment.update({
          where: { id: order.payment.id },
          data: { status: 'REFUNDED' },
        });
      }

      // Delete order
      return await this.prismaService.order.delete({
        where: { id: orderId },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to cancel order', 400);
    }
  }
}
