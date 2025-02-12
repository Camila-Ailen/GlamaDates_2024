import { BaseController } from "@/base/base.controller";
import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { In } from "typeorm";
import { PaymentService } from "./payment.service";
import { JwtService } from "@nestjs/jwt";
import { ResposeDTO } from "@/base/dto/base.dto";


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
      async savePayment(
        @Body() paymentData: { paymentId: string, paymentUrl: string }): Promise<ResposeDTO> {
        // return { payment_id: savedPayment.id }; // Devolver ID para la redirección
    
        console.log("Datos recibidos en payment:", paymentData);
    
        
        const savedPayment = await this.paymentService.confirm(paymentData);
    
        return { status: 'success', data: savedPayment };
      }


}