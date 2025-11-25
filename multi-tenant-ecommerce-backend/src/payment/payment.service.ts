import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  constructor(private prismaService: PrismaService) {}

  async createPayment(orderId: string, amount: number, method: PaymentMethod) {
    try {
      const order = await this.prismaService.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new HttpException('Order not found', 404);
      }

      const payment = await this.prismaService.payment.create({
        data: {
          orderId,
          amount,
          method,
          status: method === 'COD' ? PaymentStatus.PENDING : PaymentStatus.PENDING,
        },
      });

      // Update order with payment ID
      await this.prismaService.order.update({
        where: { id: orderId },
        data: { paymentId: payment.id },
      });

      return payment;
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create payment', 400);
    }
  }

  async createRazorpayOrder(amount: number, currency: string = 'INR') {
    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create Razorpay order', 400);
    }
  }

  async verifyRazorpayPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    try {
      const text = razorpayOrderId + '|' + razorpayPaymentId;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (generated_signature === razorpaySignature) {
        return { verified: true };
      } else {
        throw new BadRequestException('Invalid signature');
      }
    } catch (error) {
      throw new HttpException(error.message || 'Payment verification failed', 400);
    }
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    try {
      return await this.prismaService.payment.update({
        where: { id: paymentId },
        data: { status },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to update payment status', 400);
    }
  }

  async getPaymentById(id: string) {
    try {
      return await this.prismaService.payment.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
              user: true,
              address: true,
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get payment', 400);
    }
  }

  async getPaymentByOrderId(orderId: string) {
    try {
      return await this.prismaService.payment.findFirst({
        where: { orderId },
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get payment', 400);
    }
  }
}
