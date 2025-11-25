import { Controller, Post, Get, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createOrder(
    @Body()
    body: {
      userId: string;
      storeId: string;
      items: Array<{ productId: string; quantity: number; price: number }>;
      addressId?: string;
    },
  ) {
    return this.orderService.createOrder(
      body.userId,
      body.storeId,
      body.items,
      body.addressId,
    );
  }

  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Get('user/:userId')
  getUserOrders(@Param('userId') userId: string) {
    return this.orderService.getUserOrders(userId);
  }

  @Get('store/:storeId')
  getStoreOrders(@Param('storeId') storeId: string) {
    return this.orderService.getStoreOrders(storeId);
  }

  @Delete(':id')
  cancelOrder(@Param('id') id: string) {
    return this.orderService.cancelOrder(id);
  }
}
