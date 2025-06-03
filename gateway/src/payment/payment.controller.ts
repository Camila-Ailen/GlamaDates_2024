import { BaseController } from "@/base/base.controller";
import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { In } from "typeorm";
import { PaymentService } from "./payment.service";
import { JwtService } from "@nestjs/jwt";
import { ResposeDTO } from "@/base/dto/base.dto";
import { Auth } from "@/auth/auth.decorator";
import { PaginationPaymentDto } from "./dto/pagination-payment.dto";


@Controller('payment')
@ApiTags('payment')
export class PaymentController extends BaseController {
  @Inject(PaymentService)
  private paymentService: PaymentService;
  private jwtService: JwtService;

  constructor() {
    super(PaymentController);
  }


  @Post('save-payment')
  @Auth('save:payment')
  @ApiOperation({ summary: 'Save payment information' })
  async savePayment(
    @Body() paymentData: { paymentId: string, paymentUrl: string }): Promise<ResposeDTO> {
    const savedPayment = await this.paymentService.confirm(paymentData);
    return { status: 'success', data: savedPayment };
  }

  @Get('payment-url')
  @Auth('get:payment-url')
  @ApiOperation({ summary: 'Get payment URL for an appointment' })
  async getPaymentUrl(@Query('appointmentId') appointmentId: string): Promise<ResposeDTO> {
    const paymentUrl = await this.paymentService.getPaymentUrl(Number(appointmentId));
    return { status: 'success', data: paymentUrl };
  }

  @Get('all')
  @Auth('get:all-payments')
  @ApiOperation({ summary: 'Get all payments with pagination' })
  async findAll(@Query() query: PaginationPaymentDto): Promise<ResposeDTO> {
    const payments = await this.paymentService.findAll({ query });
    return { status: 'success', data: payments };
  }

  @Patch('cancel/:id')
  @Auth('cancel:payment')
  @ApiOperation({ summary: 'Cancel a payment' })
  async cancelPayment(
    @Param('id') id: number,
    @Body('observation') observation: string,
  ): Promise<ResposeDTO> {
    const canceledPayment = await this.paymentService.cancelPayment(id, observation);
    return { status: 'success', data: canceledPayment };
  }


}