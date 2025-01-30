// import { Controller, Post, Body } from '@nestjs/common';
// import { MercadoPagoService } from './mercadopago.service';

// @Controller('mercadopago')
// export class MercadoPagoController {
//   constructor(private readonly mercadoPagoService: MercadoPagoService) {}

//   @Post('create-preference')
//   async createPreference(@Body() body: { items: any[], payer: any }) {
//     return this.mercadoPagoService.createPreference(body.items, body.payer);
//   }
// }