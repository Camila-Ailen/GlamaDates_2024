import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateMercadopagoDto } from './dto/create-mercadopago.dto';
import { UpdateMercadopagoDto } from './dto/update-mercadopago.dto';
import { config } from 'dotenv';

// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { ConfigService } from '@nestjs/config';
import { AppointmentService } from '@/appointment/appointment.service';
import { Appointment } from '@/appointment/entities/appointment.entity';
import { doesNotMatch } from 'assert';
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
    const appointment = await this.appointmentService.getById(parseInt(id));
    console.log("appointment desde mp:", appointment.id.toString());
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
              unit_price: appointment.package.services.reduce((total, service) => total + service.price, 0),
            }
          ],
          back_urls: {
            success: 'https://michigram.vercel.app/',
            failure: 'https://michigram.vercel.app/',
            pending: 'https://michigram.vercel.app/',
          },
        }
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
