import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { SystemConfigDto } from './dto/system-config.dto';
import { PaginationSystemConfigDto } from './dto/pagination-system-config.dto';
import { ResposeDTO } from '@/base/dto/base.dto';

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) { }

  ///////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get()
  async getCurrentConfig(): Promise<ResposeDTO> {
    console.log('Fetching system configuration');
    const config = await this.systemConfigService.getConfig();
    return { status: 'success', data: config };
  }

  ///////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Patch(':id')
  async updateConfig(
    @Body() body: SystemConfigDto,
  ): Promise<ResposeDTO> {
    console.log('Updating system configuration from controller:', body);
    const updatedConfig = await this.systemConfigService.updateConfig(body);
    return { status: 'success', data: updatedConfig };
  }


}
