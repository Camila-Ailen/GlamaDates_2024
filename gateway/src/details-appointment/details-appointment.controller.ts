import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { DetailsAppointmentService } from './details-appointment.service';
import { Auth } from '@/auth/auth.decorator';
import { User } from '@/users/entities/user.entity';
import { PaginationDetailsAppointmentDto } from './dto/pagination-details-appointment.dto';
import { ResposeDTO } from '@/base/dto/base.dto';


@Controller('details-appointment')
export class DetailsAppointmentController {
  constructor(private readonly detailsAppointmentService: DetailsAppointmentService) {}


  ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////
    // Trae los turnos de un usuario
    // @Get('user')
    // @Auth('read:mycalendar')
    // async allByUser(@Req() request: { user: User }, @Query() query: PaginationDetailsAppointmentDto): Promise<ResposeDTO> {
    //   const user = request.user;
    //   const appointments = await this.detailsAppointmentService.allByUser(user, { query });
    //   return { status: 'success', data: appointments };
    // }


  @Post()
  create(@Body() createDetailsAppointmentDto) {
    return this.detailsAppointmentService.create(createDetailsAppointmentDto);
  }

  @Get()
  findAll() {
    return this.detailsAppointmentService.findAll();
  }
 
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detailsAppointmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetailsAppointmentDto) {
    return this.detailsAppointmentService.update(+id, updateDetailsAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detailsAppointmentService.remove(+id);
  }


}
