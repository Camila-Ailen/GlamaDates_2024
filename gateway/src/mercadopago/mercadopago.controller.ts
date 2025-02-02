import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { CreateMercadopagoDto } from './dto/create-mercadopago.dto';
import { UpdateMercadopagoDto } from './dto/update-mercadopago.dto';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '@/base/base.controller';
import { JwtService } from '@nestjs/jwt';
import { Auth } from '@/auth/auth.decorator';
import { App } from 'supertest/types';
import { AppointmentDto } from '@/appointment/dto/appointment.dto';


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
  create(@Body() appointment) {
    return this.mercadopagoService.create(appointment);
  }
}
