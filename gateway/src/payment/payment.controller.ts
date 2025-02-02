import { BaseController } from "@/base/base.controller";
import { Controller, Inject } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { In } from "typeorm";
import { PaymentService } from "./payment.service";
import { JwtService } from "@nestjs/jwt";


@Controller('payment')
@ApiTags('payment')
export class PaymentController extends BaseController {
    @Inject(PaymentService)
    private paymentService: PaymentService;
    private jwtService: JwtService;

    constructor() {
        super(PaymentController);
    }


}