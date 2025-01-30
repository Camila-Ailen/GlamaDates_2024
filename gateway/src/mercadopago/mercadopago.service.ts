// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import MercadoPago from 'mercadopago';
// import { MercadoPagoConfig, Payment } from 'mercadopago';

// @Injectable()
// export class MercadoPagoService {
//     constructor(private configService: ConfigService) {
//         MercadoPago.configurations.setAccessToken(
//           this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN'),
//         );
//       }

//       async createPayment(data: any) {
//         return await MercadoPago.payment.create(data);
//       }

// //   async createPreference(items: any[], payer: any) {
// //     try {
// //       const preference = {
// //         items: items,
// //         payer: payer,
// //         back_urls: {
// //           success: "http://localhost:3000/success",
// //           failure: "http://localhost:3000/failure",
// //           pending: "http://localhost:3000/pending"
// //         },
// //         auto_return: "approved",
// //       };

// //       const response = await mercadopago.preferences.create(preference);
// //       return response.body;
// //     } catch (error) {
// //       console.error('Error creating preference:', error);
// //       throw error;
// //     }
// //   }
// }