import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { CreateMercadopagoDto } from './dto/create-mercadopago.dto';
import { UpdateMercadopagoDto } from './dto/update-mercadopago.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '@/base/base.controller';
import { JwtService } from '@nestjs/jwt';
import { Auth } from '@/auth/auth.decorator';
import { App } from 'supertest/types';
import { AppointmentDto } from '@/appointment/dto/appointment.dto';
import { Payment } from 'mercadopago';
import { PaymentDto } from '@/payment/dto/payment.dto';
import { ResposeDTO } from '@/base/dto/base.dto';


@Controller('mercadopago')
@ApiTags('mercadopago')
export class MercadopagoController extends BaseController {
  @Inject(MercadopagoService)
  private mercadopagoService: MercadopagoService;
  private jwtService: JwtService;

  constructor() {
    super(MercadopagoController);
  }

  @Post()
  @Auth('create:mercadopago')
  @ApiOperation({ summary: 'Create a new payment with MercadoPago' })
  create(@Body() appointment) {
    return this.mercadopagoService.create(appointment);
  }


  // @Post('save-payment')
  // async savePayment(
  //   @Body() paymentData: { paymentId: string, paymentUrl: string }): Promise<ResposeDTO> {
  //   // return { payment_id: savedPayment.id }; // Devolver ID para la redirección

  //   console.log("Datos recibidos:", paymentData);

    
  //   const savedPayment = await this.mercadopagoService.confirm(paymentData);

  //   return { status: 'success', data: savedPayment };
  // }

}
