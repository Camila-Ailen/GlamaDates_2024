import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { SystemConfigDto } from './dto/system-config.dto';
import { PaginationSystemConfigDto } from './dto/pagination-system-config.dto';
import { ResposeDTO } from '@/base/dto/base.dto';
import { Auth } from '@/auth/auth.decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) { }

  ///////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get()
  @Auth('read:system-config')
  @ApiOperation({ summary: 'Get all system configurations' })
  async getCurrentConfig(): Promise<ResposeDTO> {
    const config = await this.systemConfigService.getConfig();
    return { status: 'success', data: config };
  }

  ///////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Patch(':id')
  @Auth('update:system-config')
  @ApiOperation({ summary: 'Update a specific system configuration' })
  async updateConfig(
    @Body() body: SystemConfigDto,
  ): Promise<ResposeDTO> {
    const updatedConfig = await this.systemConfigService.updateConfig(body);
    return { status: 'success', data: updatedConfig };
  }


}
