import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { config } from 'dotenv';

// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { ConfigService } from '@nestjs/config';
import { AppointmentService } from '@/appointment/appointment.service';

// Agrega credenciales
  
@Injectable()
export class MercadopagoService {
  @Inject((forwardRef(() => AppointmentService)))
  private appointmentService: AppointmentService;
  async create(id) {
    config();
    const configService = new ConfigService();
    const client = new MercadoPagoConfig({ accessToken: configService.get('MERCADOPAGO_ACCESS_TOKEN') });
    const preference = new Preference(client);
    // console.log("id desde mp:", id);
    const appointment = await this.appointmentService.getById(id);
    // console.log("appointment desde mp:", appointment.id.toString());
    if (!appointment) {
      throw new Error("Appointment not found");
    }
      
    try {
      const response = await preference.create({
        body: {
          items: [
            {
              id: appointment.id.toString(),
              title: appointment.package.name,
              quantity: 1,
              unit_price: appointment.total - appointment.discount,
              currency_id: 'ARS',
            }
          ],
          back_urls: {
            success: 'https://localhost:3001/redirect',
            failure: 'https://localhost:3001/catalog',
            pending: 'https://localhost:3001/login',
          },
          auto_return: "approved",
        }
      });
      // console.log(response);
      return response;

      
    } catch (error) {
      console.log(error);
      throw error;
    }
  }



}
