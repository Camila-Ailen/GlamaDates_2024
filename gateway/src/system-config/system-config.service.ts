import { Injectable } from '@nestjs/common';
import { SystemConfigDto } from './dto/system-config.dto';
import { PaginationSystemConfigDto } from './dto/pagination-system-config.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemConfig } from './entities/system-config.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SystemConfigService {

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepository: Repository<SystemConfig>,
  ) {}

  async getSystemConfig(): Promise<SystemConfig> {
    const config = await this.configRepository.findOne({ where: { id: 1 } });
    if (!config) {
      throw new Error('Configuration not found');
    }
    return config;
  }
}
