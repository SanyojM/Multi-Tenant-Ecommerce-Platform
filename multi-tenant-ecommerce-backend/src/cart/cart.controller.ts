import { Controller, Post, Get, Patch, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('add')
  @UsePipes(ValidationPipe)
  addToCart(
    @Body() body: { userId: string; productId: string; quantity?: number },
  ) {
    return this.cartService.addToCart(body.userId, body.productId, body.quantity || 1);
  }

  @Get(':userId')
  getCartItems(@Param('userId') userId: string) {
    return this.cartService.getCartItems(userId);
  }

  @Get(':userId/total')
  getCartTotal(@Param('userId') userId: string) {
    return this.cartService.getCartTotal(userId);
  }

  @Patch(':cartItemId')
  @UsePipes(ValidationPipe)
  updateCartItemQuantity(
    @Param('cartItemId') cartItemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateCartItemQuantity(cartItemId, body.quantity);
  }

  @Delete(':cartItemId')
  removeFromCart(@Param('cartItemId') cartItemId: string) {
    return this.cartService.removeFromCart(cartItemId);
  }

  @Delete('clear/:userId')
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
