import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { SystemConfigDto } from './dto/system-config.dto';
import { PaginationSystemConfigDto } from './dto/pagination-system-config.dto';

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  
  
}
