import { Controller, Post, Body, Get, Param, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createPayment(
    @Body() body: { orderId: string; amount: number; method: PaymentMethod },
  ) {
    return this.paymentService.createPayment(body.orderId, body.amount, body.method);
  }

  @Post('razorpay/create-order')
  @UsePipes(ValidationPipe)
  createRazorpayOrder(@Body() body: { amount: number; currency?: string }) {
    return this.paymentService.createRazorpayOrder(body.amount, body.currency);
  }

  @Post('razorpay/verify')
  @UsePipes(ValidationPipe)
  verifyRazorpayPayment(
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    return this.paymentService.verifyRazorpayPayment(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
    );
  }

  @Patch(':id/status')
  @UsePipes(ValidationPipe)
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { status: PaymentStatus },
  ) {
    return this.paymentService.updatePaymentStatus(id, body.status);
  }

  @Get(':id')
  getPaymentById(@Param('id') id: string) {
    return this.paymentService.getPaymentById(id);
  }

  @Get('order/:orderId')
  getPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrderId(orderId);
  }
}
