import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  ////////////////////////////////////////////
  ////////////////////////////////////////////
  async getConfig(): Promise<SystemConfig> {
    const config = await this.configRepository.findOne({
          where: {
            id: 1,
          },
        });
        if (!config) throw new HttpException('Config not found', HttpStatus.NOT_FOUND);
        return config;
  }

  ////////////////////////////////////////////
  ////////////////////////////////////////////
  async updateConfig(body: SystemConfigDto): Promise<SystemConfig> {
    const config = await this.configRepository.findOne({ where: { id: 1 } });
    if (!config) {
      throw new HttpException('Configuration not found', HttpStatus.NOT_FOUND);
    }
    console.log('Updating system configuration:', body);
    console.log('Current configuration:', config);
    Object.assign(config, body);
    return await this.configRepository.save(config);
  }
}
